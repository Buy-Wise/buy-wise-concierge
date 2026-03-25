const OpenAI = require('openai');
const db = require('../config/db');
const { buildReportPrompt } = require('../utils/promptBuilder');
const { generatePDF } = require('../utils/pdfGenerator');

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

    // Update order to IN_PROGRESS
    await db.query("UPDATE orders SET status = 'IN_PROGRESS' WHERE id = $1", [orderId]);

    let rawOutput = '';
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      });
      rawOutput = completion.choices[0].message.content;
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

    await db.query('UPDATE reports SET pdf_url = $1 WHERE order_id = $2', [pdfPath, orderId]);

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

const sendViaWhatsApp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const reportResult = await db.query(`
      SELECT r.pdf_url, u.name, u.phone_whatsapp
      FROM reports r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE r.order_id = $1
    `, [orderId]);

    if (reportResult.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    const { pdf_url, name, phone_whatsapp } = reportResult.rows[0];

    if (!pdf_url) return res.status(400).json({ error: 'PDF not generated yet. Generate PDF first.' });

    const watiEndpoint = process.env.WATI_API_ENDPOINT;
    const watiToken = process.env.WATI_API_TOKEN;

    if (watiEndpoint && watiToken) {
      const fetch = (await import('node-fetch')).default;
      // Send via WATI API
      const message = `Hi ${name}! 🎉\n\nYour Buy Wise Report is ready.\n\nHere are your top picks based on your requirements.\n\n📎 Report attached as PDF.\n\nNeed clarification? Reply to this message.\n\n— Buy Wise Team`;
      
      await fetch(`${watiEndpoint}/api/v1/sendSessionMessage/${phone_whatsapp}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${watiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: message })
      });
    } else {
      console.log(`[MOCK] Would send WhatsApp to ${phone_whatsapp} with PDF: ${pdf_url}`);
    }

    // Update order as delivered
    await db.query("UPDATE orders SET status = 'DELIVERED', delivered_at = NOW() WHERE id = $1", [orderId]);
    await db.query("UPDATE reports SET delivered_at = NOW(), delivery_method = 'WHATSAPP' WHERE order_id = $1", [orderId]);

    res.json({ success: true, message: `Report sent to ${phone_whatsapp}` });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ error: 'Failed to send via WhatsApp' });
  }
};

module.exports = { generateReport, generatePDFRoute, getReport, sendViaWhatsApp };
