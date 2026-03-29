const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// POST /api/feedback/submit — requires authentication
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { orderId, rating, was_helpful, did_purchase, comments } = req.body;
    if (!orderId || !rating) return res.status(400).json({ error: 'orderId and rating required' });

    const result = await db.query(
      'INSERT INTO feedback (order_id, rating, was_helpful, did_purchase, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, rating, was_helpful, did_purchase, comments]
    );

    res.status(201).json({ success: true, feedback: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
});

// GET /api/feedback/order/:orderId — requires authentication
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM feedback WHERE order_id = $1', [req.params.orderId]);
    res.json({ feedback: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
