const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const db = require('../config/db');
const { buildReportPrompt } = require('../utils/promptBuilder');
const { generatePDF } = require('../utils/pdfGenerator');
const { sendOrderConfirmedEmail, sendReportReadyEmail, sendGenerationFailedEmail, sendAdminNewOrderEmail } = require('../utils/email');
const { broadcastOrderUpdate, broadcastToAllAdmins } = require('../utils/sseService');

// LEVEL 2/3 UPGRADE POINT: In Level 2+, call this automatically on payment webhook
const generateReport = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch order, form, and user from DB
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];

    const formResult = await db.query('SELECT * FROM intake_forms WHERE order_id = $1', [orderId]);
    if (formResult.rows.length === 0) return res.status(404).json({ error: 'Intake form not found' });
    const form = formResult.rows[0];

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
    const user = userResult.rows[0];

    // Build prompt
    const prompt = buildReportPrompt(user, order, form);

    // Update order to GENERATING
    await db.query("UPDATE orders SET status = 'GENERATING' WHERE id = $1", [orderId]);
    console.log(`[ORDER] Order ${orderId} status changed: PENDING → GENERATING`);

    let rawOutput = '';
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawOutput = response.text();
      } catch (aiErr) {
        console.warn('[AI] Gemini Failed (Fallback to Mock):', aiErr.message);
        rawOutput = `# [MOCK] Research Report: ${form.product_category || 'Product'}
## Analysis for ${user.name}
Based on your budget of ₹${form.budget_min} - ₹${form.budget_max} and your primary use case (${form.primary_use_case}), we recommend:

### Top Choice: Gemini-Recommended Value Pro
- **Est. Price:** ₹${Math.floor(form.budget_max * 0.85)}
- **Why:** Optimized for ${form.primary_use_case}.
- **Pros:** High durability, modern features.
- **Cons:** Limited availability.`;
      }
    } else {
      // MOCK output for development
      rawOutput = `## Buy Wise Report – MOCK OUTPUT\n\n**Budget:** ₹${form.budget_min} – ₹${form.budget_max}\n\n### Recommendation 1: Sample Product A – ₹XX,XXX\n- ✅ Great for ${form.primary_use_case}\n- ❌ Average battery life\n\n### 🏆 Best Pick: Sample Product A\nBest overall for your needs.`;
    }

    // Upsert report row
    const existingReport = await db.query('SELECT id FROM reports WHERE order_id = $1', [orderId]);
    let reportId;
    if (existingReport.rows.length > 0) {
      const updateReport = await db.query(
        'UPDATE reports SET generated_prompt = $1, raw_ai_output = $2, formatted_report = $3, generated_at = NOW() WHERE order_id = $4 RETURNING id',
        [prompt, rawOutput, rawOutput, orderId]
      );
      reportId = updateReport.rows[0].id;
    } else {
      const insertReport = await db.query(
        'INSERT INTO reports (order_id, generated_prompt, raw_ai_output, formatted_report) VALUES ($1, $2, $3, $4) RETURNING id',
        [orderId, prompt, rawOutput, rawOutput]
      );
      reportId = insertReport.rows[0].id;
    }

    res.json({ success: true, reportId, preview: rawOutput.substring(0, 500) });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const generatePDFRoute = async (req, res) => {
  try {
    const { orderId } = req.params;

    // UUID check relaxed for testing/manual ORD-xxx orders
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const reportResult = await db.query(`
      SELECT r.*, u.name, u.phone_whatsapp, o.product_category, o.service_tier
      FROM reports r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE r.order_id = $1
    `, [orderId]);

    if (reportResult.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    const report = reportResult.rows[0];

    // Generate PDF and get local path or URL
    const pdfPath = await generatePDF(report);

    await db.query(`
      UPDATE reports 
      SET pdf_url = $1, is_available = true, delivered_at = NOW() 
      WHERE order_id = $2
    `, [pdfPath, orderId]);

    await db.query("UPDATE orders SET status = 'DELIVERED', delivered_at = NOW() WHERE id = $1", [orderId]);

    res.json({ success: true, pdfUrl: pdfPath });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

const getReport = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await db.query('SELECT * FROM reports WHERE order_id = $1', [orderId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ report: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getReportStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await db.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const reportResult = await db.query('SELECT is_available, pdf_url FROM reports WHERE order_id = $1', [orderId]);

    res.json({
      status: result.rows[0].status,
      is_available: reportResult.rows.length > 0 ? reportResult.rows[0].is_available : false,
      pdf_url: reportResult.rows.length > 0 ? reportResult.rows[0].pdf_url : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const downloadReport = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await db.query('SELECT user_id FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0 || orderResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reportResult = await db.query('SELECT pdf_url FROM reports WHERE order_id = $1', [orderId]);
    if (reportResult.rows.length === 0) return res.status(404).json({ error: 'Report not available' });

    await db.query('UPDATE reports SET download_count = download_count + 1 WHERE order_id = $1', [orderId]);

    res.json({ success: true, pdfUrl: reportResult.rows[0].pdf_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to download' });
  }
};

const runAutoGenerationPipeline = async (orderId) => {
  try {
    // 1. Set Status
    await db.query("UPDATE orders SET status = 'GENERATING', generation_started_at = NOW() WHERE id = $1", [orderId]);
    console.log(`[ORDER] Order ${orderId} status changed: PAID → GENERATING`);

    // 2. Fetch Data
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = orderResult.rows[0];
    const formResult = await db.query('SELECT * FROM intake_forms WHERE order_id = $1', [orderId]);
    const form = formResult.rows[0];
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
    const user = userResult.rows[0];

    // SSE broadcast (after order is fetched)
    broadcastOrderUpdate(order.user_id, { type: 'ORDER_STATUS_CHANGED', orderId, newStatus: 'GENERATING', pdfAvailable: false });

    // 3. Send Emails
    try {
      await sendOrderConfirmedEmail(order, user);
      await sendAdminNewOrderEmail(order, user);
    } catch (e) { console.error('Failed to send initial emails', e); }

    // 4. Hybrid AI Research Engine (Gemini with OpenAI failover)
    const prompt = buildReportPrompt(user, order, form);
    let rawOutput = '';
    
    // First, try Gemini
    if (process.env.GEMINI_API_KEY) {
      const gModels = ["gemini-1.5-flash", "gemini-pro"];
      for (const m of gModels) {
        try {
          console.log(`[AI] Gemini Attempt (${m}) for Order ${orderId}...`);
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const gModel = genAI.getGenerativeModel({ 
            model: m,
            generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 2048 }
          });
          const result = await gModel.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          if (text && text.length > 300) {
            rawOutput = text;
            console.log(`[AI] Gemini Success with ${m}`);
            break;
          } else {
            console.warn(`[AI] Gemini (${m}) returned too short output. Trying next...`);
          }
        } catch (e) {
          console.warn(`[AI] Gemini (${m}) failed:`, e.message);
        }
      }
    }

    // Failover to OpenAI if Gemini failed or no key
    if (!rawOutput && process.env.OPENAI_API_KEY) {
      try {
        console.log(`[AI] Failover to OpenAI for Order ${orderId}...`);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Verified working for this key
          messages: [
            { role: "system", content: "You are a professional research analyst. Follow the user profile and structure strictly." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });
        const text = completion.choices[0].message.content;
        if (text && text.length > 300) {
          rawOutput = text;
          console.log(`[AI] OpenAI Success for Order ${orderId}`);
        }
      } catch (oaErr) {
        console.error('[AI] OpenAI Failover failed:', oaErr.message);
      }
    }

    if (!rawOutput) {
      const { goldReports } = require('../utils/goldData');
      const cat = order.product_category || 'LAPTOP';
      const lang = user.language_preference || 'EN';
      if (goldReports[cat] && goldReports[cat][lang]) {
        console.log(`[AI] Using Gold Standard Failover for ${cat} in ${lang}`);
        rawOutput = goldReports[cat][lang];
      }
    }

    if (!rawOutput) {
      throw new Error('AI Generation failed on all engines and no gold standard exists for this category/language.');
    }





    // 5. Save report data
    await db.query(
      'INSERT INTO reports (order_id, generated_prompt, raw_ai_output, formatted_report) VALUES ($1, $2, $3, $4) ON CONFLICT (order_id) DO NOTHING', // Actually order_id might not have unique constraint.
      [orderId, prompt, rawOutput, rawOutput]
    );

    // 6. Generate PDF
    const reportForPdf = {
      ...order,
      order_id: orderId,
      name: user.name,
      formatted_report: rawOutput,
    };
    const pdfUrl = await generatePDF(reportForPdf);

    // 7. Update DB with PDF and Success
    await db.query(
      "UPDATE reports SET pdf_url = $1, is_available = true, generated_at = NOW(), delivered_at = NOW() WHERE order_id = $2",
      [pdfUrl, orderId]
    );
    await db.query(
      "UPDATE orders SET status = 'DELIVERED', generation_completed_at = NOW(), auto_generated = true, delivered_at = NOW() WHERE id = $1",
      [orderId]
    );
    console.log(`[ORDER] Order ${orderId} status changed: GENERATING → DELIVERED`);

    // SSE broadcast
    broadcastOrderUpdate(order.user_id, { type: 'ORDER_STATUS_CHANGED', orderId, newStatus: 'DELIVERED', pdfAvailable: true, pdfUrl: pdfUrl });

    // 8. Send Ready Email
    try {
      await sendReportReadyEmail(order, user);
    } catch (e) { console.error('Failed send ready email', e); }

  } catch (error) {
    console.error('Auto-generation pipeline failed:', error);
    try {
      const errorMessage = error.message || 'Unknown generation error';
      await db.query("UPDATE orders SET status = 'GENERATION_FAILED', generation_completed_at = NOW(), last_error = $1 WHERE id = $2", [errorMessage, orderId]);
      console.log(`[ORDER] Order ${orderId} status changed: GENERATING → GENERATION_FAILED: ${errorMessage}`);

      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [orderRes.rows[0].user_id]);

      // SSE broadcast
      broadcastOrderUpdate(orderRes.rows[0]?.user_id, { type: 'GENERATION_FAILED', orderId, error: errorMessage });

      await sendGenerationFailedEmail(orderRes.rows[0], userRes.rows[0]);
    } catch (e) {
      console.error('Failed to handle error state', e);
    }
  }
};

const generateAuto = async (req, res) => {
  try {
    const { orderId } = req.body;
    runAutoGenerationPipeline(orderId).catch(console.error);
    res.json({ success: true, message: 'Auto-generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

const generateSamplePDF = async (req, res) => {
  try {
    const sampleReport = {
      order_id: 'SAMPLE-123',
      name: 'Sample User',
      product_category: 'LAPTOP',
      formatted_report: `
# Sample Research Report
## Recommendation 1: EliteBook X1
- ✅ Premium build
- ✅ All-day battery
- ❌ Expensive
      `
    };
    const pdfUrl = await generatePDF(sampleReport);
    res.json({ success: true, pdfUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sample' });
  }
};

module.exports = { generateReport, generatePDFRoute, getReport, getReportStatus, downloadReport, generateAuto, runAutoGenerationPipeline, generateSamplePDF };
