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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
    
    // First, try Gemini (models ordered: fastest/cheapest first, most capable last)
    if (process.env.GEMINI_API_KEY) {
      const gModels = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];
      for (const m of gModels) {
        if (rawOutput) break; // Already got output from a previous model
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[AI] Gemini Attempt #${attempt} (${m}) for Order ${orderId}...`);
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
              console.log(`[AI] Gemini Success with ${m} (attempt #${attempt})`);
              break; // inner loop
            } else {
              console.warn(`[AI] Gemini (${m}) returned too short output. Trying next model...`);
              break; // short output — skip this model
            }
          } catch (e) {
            const isRateLimit = e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED') || e.message?.toLowerCase().includes('quota');
            console.warn(`[AI] Gemini (${m}) attempt #${attempt} failed:`, e.message?.substring(0, 120));
            if (isRateLimit && attempt < 2) {
              console.log(`[AI] Rate limit hit — waiting 15s before retry...`);
              await new Promise(r => setTimeout(r, 15000));
            } else {
              break; // Not rate limited or last attempt — move to next model
            }
          }
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
      // Last-resort structural fallback — always deliver something useful
      console.warn(`[AI] All engines failed for Order ${orderId}. Using structural fallback.`);
      const cat = order.product_category || 'Product';
      const budgetMin = form?.budget_min || 0;
      const budgetMax = form?.budget_max || 0;
      const useCase = form?.primary_use_case || 'General use';
      rawOutput = `# Buy Wise Research Report — ${cat}

## For: ${user?.name || 'Valued Customer'}
**Budget:** ₹${Number(budgetMin).toLocaleString('en-IN')} – ₹${Number(budgetMax).toLocaleString('en-IN')}  
**Primary Use:** ${useCase}

---

## Our Research Summary

We have analysed the current market for **${cat}** products in your budget range.

### What To Look For

Given your budget of ₹${Number(budgetMin).toLocaleString('en-IN')}–₹${Number(budgetMax).toLocaleString('en-IN')} and use case of **${useCase}**, here are our key recommendations:

1. **Prioritise value-for-money** — choose a brand with strong after-sales service in India (Samsung, Apple, Xiaomi, HP, Dell, Lenovo)
2. **Check real-user reviews** on platforms like Smartprix, 91mobiles, or Notebookcheck rather than brand websites
3. **Avoid buying at launch price** — wait 4–6 weeks after a product launch for the real-world verdict
4. **Verify warranty terms** — ensure minimum 1-year manufacturer warranty with Indian service centres

### Budget Guidance

| Budget Range | Category |
|---|---|
| ₹10,000 – ₹20,000 | Entry-level / Budget |
| ₹20,000 – ₹40,000 | Mid-range (Best Value) |
| ₹40,000 – ₹70,000 | Upper mid-range |
| ₹70,000+ | Premium / Flagship |

Your budget of ₹${Number(budgetMax).toLocaleString('en-IN')} places you in the **${Number(budgetMax) >= 70000 ? 'Premium' : Number(budgetMax) >= 40000 ? 'Upper Mid-range' : Number(budgetMax) >= 20000 ? 'Mid-range (Best Value)' : 'Entry-level'}** tier.

### Next Steps

> **Note:** Our AI research engine encountered a temporary issue generating your personalised analysis. A member of our team will review your order and send you a detailed updated report within 24 hours. We apologise for the inconvenience.

---
*Report generated by Buy Wise | askbuywise.vercel.app*`;
    }

    // 5. Save report data (check-then-upsert – safe without a UNIQUE constraint on order_id)
    const existingRpt = await db.query('SELECT id FROM reports WHERE order_id = $1', [orderId]);
    if (existingRpt.rows.length > 0) {
      await db.query(
        `UPDATE reports SET raw_ai_output = $1, formatted_report = $2, generated_prompt = $3, generated_at = NOW() WHERE order_id = $4`,
        [rawOutput, rawOutput, prompt, orderId]
      );
    } else {
      await db.query(
        `INSERT INTO reports (order_id, generated_prompt, raw_ai_output, formatted_report) VALUES ($1, $2, $3, $4)`,
        [orderId, prompt, rawOutput, rawOutput]
      );
    }

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
