const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

console.log('✅ Feedback initialization module loaded');

console.log('✅ Feedback routes module loaded');

// Rate limiter: max 5 feedback submissions per IP per hour
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many feedback submissions. Please try again in an hour.' }
});

// XSS sanitization: strip HTML tags from a string
const sanitize = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim().substring(0, 2000);
};

// POST /api/feedback/submit — requires authentication
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { orderId, rating, was_helpful, did_purchase, comments } = req.body;
    if (!orderId || !rating) return res.status(400).json({ error: 'orderId and rating required' });

    const result = await db.query(
      'INSERT INTO feedback (order_id, rating, was_helpful, did_purchase, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, rating, was_helpful, did_purchase, sanitize(comments)]
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

// POST /api/feedback/suggest — Native product suggestion feedback (rate limited)
router.post('/suggest', verifyToken, feedbackLimiter, async (req, res) => {
  try {
    const { rating, general_feedback, product_suggestion, would_recommend } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'A rating between 1 and 5 is required.' });
    }

    const userId = req.user.id;

    await db.query(
      `INSERT INTO feedback (user_id, rating, general_feedback, product_suggestion, would_recommend)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        rating,
        sanitize(general_feedback),
        sanitize(product_suggestion),
        would_recommend === true || would_recommend === 'true'
      ]
    );

    res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('[FEEDBACK/SUGGEST]', error);
    res.status(500).json({ error: 'Server error submitting suggestion.' });
  }
});

module.exports = router;
