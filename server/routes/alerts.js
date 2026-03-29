const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// POST /api/alerts/create
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { product_name, target_price, current_price } = req.body;
    if (!product_name || !target_price) return res.status(400).json({ error: 'product_name and target_price required' });

    const activeCountRes = await db.query("SELECT COUNT(*) as count FROM price_alerts WHERE user_id = $1", [req.user.id]);
    if (parseInt(activeCountRes.rows[0].count) >= 10) {
      return res.status(400).json({ error: "You've reached the maximum of 10 free price alerts. Remove an alert to add a new one." });
    }

    const result = await db.query(
      'INSERT INTO price_alerts (user_id, product_name, target_price, current_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, product_name, target_price, current_price || null]
    );

    res.status(201).json({ success: true, alert: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating alert' });
  }
});

// GET /api/alerts/user/:userId
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await db.query("SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC", [req.params.userId]);
    res.json({ alerts: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/alerts/:id/edit
router.patch('/:id/edit', verifyToken, async (req, res) => {
  try {
    const { target_price } = req.body;
    if (!target_price) return res.status(400).json({ error: 'target_price is required' });
    
    const result = await db.query(
      "UPDATE price_alerts SET target_price = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [target_price, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found or not owned by user' });
    res.json({ success: true, alert: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM price_alerts WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found or not owned by user' });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/alerts/:id/cancel
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE price_alerts SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found or not owned by user' });
    res.json({ success: true, alert: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
