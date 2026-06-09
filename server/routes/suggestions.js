const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let { product_name, product_url, category, notes } = req.body;
    
    if (!product_name || !product_name.trim()) {
      return res.status(400).json({ error: "Product name is required." });
    }

    product_name = product_name.trim();
    product_url = product_url ? product_url.trim() : null;
    category = category ? category.trim() : null;
    notes = notes ? notes.trim() : null;

    await db.query(
      `INSERT INTO product_suggestions (user_id, product_name, product_url, category, notes, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [userId, product_name, product_url, category, notes]
    );

    res.status(201).json({ message: "Thank you! Your suggestion has been submitted for review." });
  } catch (error) {
    console.error('Error submitting product suggestion:', error);
    res.status(500).json({ error: "Could not save your suggestion. Please try again." });
  }
});

module.exports = router;
