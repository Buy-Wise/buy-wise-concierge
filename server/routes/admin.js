const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const sheetsService = require('../utils/googleSheetsService');

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
    if (tier) { conditions.push(`o.service_tier = $${values.length + 1}`); values.push(tier); }
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

// GET /api/admin/analytics — expanded with full metrics
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    const [
      totalOrdersRes,
      revenueTotalRes,
      ordersByTierRes,
      ordersByCategoryRes,
      recentOrdersRes,
      avgRatingRes,
      todayRes,
      weekRes,
      monthRes,
      pendingRes,
      failedRes,
      deliveredRes,
      downloadsRes,
      revenueByDayRes,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) FROM orders WHERE status != 'CANCELLED'"),
      db.query("SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status IN ('PAID', 'GENERATING', 'DELIVERED')"),
      db.query("SELECT service_tier, COUNT(*) as count, COALESCE(SUM(amount),0)/100 as revenue FROM orders WHERE status IN ('PAID','GENERATING','DELIVERED') GROUP BY service_tier"),
      db.query("SELECT product_category, COUNT(*) as count FROM orders WHERE status != 'CANCELLED' GROUP BY product_category"),
      db.query("SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'"),
      db.query("SELECT ROUND(AVG(rating), 2) as avg_rating FROM feedback"),
      db.query("SELECT COUNT(*) as orders, COALESCE(SUM(amount),0)/100 as revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('PAID','GENERATING','DELIVERED')"),
      db.query("SELECT COUNT(*) as orders, COALESCE(SUM(amount),0)/100 as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '7 days' AND status IN ('PAID','GENERATING','DELIVERED')"),
      db.query("SELECT COUNT(*) as orders, COALESCE(SUM(amount),0)/100 as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '30 days' AND status IN ('PAID','GENERATING','DELIVERED')"),
      db.query("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'"),
      db.query("SELECT COUNT(*) FROM orders WHERE status = 'GENERATION_FAILED'"),
      db.query("SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED'"),
      db.query("SELECT COALESCE(SUM(download_count), 0) as total FROM reports"),
      db.query("SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(amount),0)/100 as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '30 days' AND status IN ('PAID','GENERATING','DELIVERED') GROUP BY DATE(created_at) ORDER BY date ASC"),
    ]);

    const totalOrders = parseInt(totalOrdersRes.rows[0].count);
    const totalRevenue = parseInt(revenueTotalRes.rows[0].total);
    const deliveredCount = parseInt(deliveredRes.rows[0].count);
    const paidAndDelivered = deliveredCount + parseInt(pendingRes.rows[0].count);

    res.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue / 100,
        ordersToday: parseInt(todayRes.rows[0].orders),
        revenueToday: parseInt(todayRes.rows[0].revenue),
        ordersThisWeek: parseInt(weekRes.rows[0].orders),
        revenueThisWeek: parseInt(weekRes.rows[0].revenue),
        ordersThisMonth: parseInt(monthRes.rows[0].orders),
        revenueThisMonth: parseInt(monthRes.rows[0].revenue),
        pendingOrders: parseInt(pendingRes.rows[0].count),
        failedGenerations: parseInt(failedRes.rows[0].count),
      },
      ordersByTier: ordersByTierRes.rows.map(r => ({ tier: r.service_tier, count: parseInt(r.count), revenue: parseInt(r.revenue) })),
      ordersByCategory: ordersByCategoryRes.rows.map(r => ({ category: r.product_category, count: parseInt(r.count) })),
      revenueByDay: revenueByDayRes.rows.map(r => ({ date: r.date, orders: parseInt(r.orders), revenue: parseInt(r.revenue) })),
      topMetrics: {
        conversionRate: totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / 100 / totalOrders) : 0,
        reportSuccessRate: paidAndDelivered > 0 ? Math.round((deliveredCount / paidAndDelivered) * 100) : 0,
        totalDownloads: parseInt(downloadsRes.rows[0].total),
      },
      avgRating: parseFloat(avgRatingRes.rows[0].avg_rating || 0),
      recentOrdersCount: parseInt(recentOrdersRes.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

// GET /api/admin/feedback — paginated feedback listing
router.get('/feedback', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT f.*, u.name as customer_name, u.email as customer_email,
             o.product_category, o.service_tier,
             CONCAT('BW-', SUBSTRING(o.id::text, 1, 8)) as order_id_short
      FROM feedback f
      JOIN orders o ON f.order_id = o.id
      JOIN users u ON o.user_id = u.id
    `;
    const conditions = [];
    const values = [];
    if (rating) { conditions.push(`f.rating = $${values.length + 1}`); values.push(parseInt(rating)); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY f.submitted_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit), offset);

    const [feedbackRes, totalRes, summaryRes] = await Promise.all([
      db.query(query, values),
      db.query('SELECT COUNT(*) FROM feedback'),
      db.query(`SELECT 
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(CASE WHEN was_helpful = true THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as helpful_rate,
        COUNT(CASE WHEN did_purchase = true THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as purchase_rate
      FROM feedback`)
    ]);

    res.json({
      feedback: feedbackRes.rows,
      total: parseInt(totalRes.rows[0].count),
      avgRating: parseFloat(summaryRes.rows[0].avg_rating || 0),
      helpfulRate: Math.round(parseFloat(summaryRes.rows[0].helpful_rate || 0)),
      purchaseRate: Math.round(parseFloat(summaryRes.rows[0].purchase_rate || 0)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching feedback' });
  }
});

// POST /api/admin/sync-sheets — Real Google Sheets sync
router.post('/sync-sheets', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!sheetsService.isEnabled()) {
      return res.json({ success: false, message: 'Google Sheets sync is disabled. Set SHEETS_SYNC_ENABLED=true in .env' });
    }
    const result = await sheetsService.syncAllOrders(db);
    res.json({ success: true, ...result, message: `Synced ${result.synced} orders to Google Sheets` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error syncing to Google Sheets' });
  }
});

// GET /api/admin/sheets/test — Test Google Sheets connection
router.get('/sheets/test', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await sheetsService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/sheets/setup — Setup spreadsheet headers
router.post('/sheets/setup', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await sheetsService.setupHeaders();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/generate-pdf/:orderId
router.post('/generate-pdf/:orderId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`[Admin] Starting PDF generation for Order: ${orderId}`);

    const { generateReportV2 } = require('./reports');

    const fakeReq = { params: { orderId } };
    const fakeRes = {
      status: () => ({ json: () => { } }),
      json: (data) => console.log("[Admin Internal] Tool response:", data)
    };

    generateReportV2(fakeReq, fakeRes)
      .then(() => console.log(`[Admin] Successfully triggered generation for ${orderId}`))
      .catch(err => console.error('CRITICAL ERROR:', err.stack));

    res.json({ success: true, message: 'Generation started in background.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to trigger PDF generation' });
  }
});

module.exports = router;
