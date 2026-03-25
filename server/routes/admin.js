const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/admin/orders — with optional status / tier filters
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, tier, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT o.*, u.name, u.email, u.phone_whatsapp, r.pdf_url
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN reports r ON o.id = r.order_id
    `;
    const conditions = [];
    const values = [];
    if (status) { conditions.push(`o.status = $${values.length + 1}`); values.push(status); }
    if (tier)   { conditions.push(`o.service_tier = $${values.length + 1}`); values.push(tier); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    const [
      totalOrders,
      revenueTotal,
      ordersByTier,
      recentOrders,
      avgRating,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) FROM orders WHERE status != 'CANCELLED'"),
      db.query("SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status IN ('PAID', 'IN_PROGRESS', 'DELIVERED')"),
      db.query("SELECT service_tier, COUNT(*) as count FROM orders GROUP BY service_tier"),
      db.query("SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'"),
      db.query("SELECT ROUND(AVG(rating), 2) as avg_rating FROM feedback"),
    ]);

    res.json({
      totalOrders: parseInt(totalOrders.rows[0].count),
      revenue: parseInt(revenueTotal.rows[0].total),
      ordersByTier: ordersByTier.rows,
      recentOrders: parseInt(recentOrders.rows[0].count),
      avgRating: parseFloat(avgRating.rows[0].avg_rating || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

// POST /api/admin/sync-sheets — LEVEL 2 stub
router.post('/sync-sheets', verifyToken, isAdmin, async (req, res) => {
  try {
    // LEVEL 2 UPGRADE: Connect to Google Sheets API and append/update rows
    // Currently returns a stub response
    console.log('[Google Sheets Sync] Stub called — implement with google-auth-library in Level 2');
    const result = await db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
    
    // TODO: Append to Google Sheets using service account credentials
    // const { google } = require('googleapis');
    // const auth = new google.auth.GoogleAuth({ ... });
    // const sheets = google.sheets({ version: 'v4', auth });
    // await sheets.spreadsheets.values.append({ ... });

    res.json({ success: true, syncedRows: result.rows.length, message: 'Google Sheets sync stub. Implement with service account.' });
  } catch (error) {
    res.status(500).json({ error: 'Error syncing to Google Sheets' });
  }
});

module.exports = router;
