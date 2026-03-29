const db = require('../config/db');

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    // Check if user owns order or is admin
    if (req.user.role !== 'admin' && result.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await db.query(`
      SELECT o.*, r.pdf_url, r.is_available 
      FROM orders o 
      LEFT JOIN reports r ON o.id = r.order_id 
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC
    `, [userId]);
    
    res.json({ orders: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving user orders' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, r.pdf_url, r.is_available 
      FROM orders o 
      LEFT JOIN reports r ON o.id = r.order_id 
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    
    res.json({ orders: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving your orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Admin only route handled via middleware
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating status' });
  }
};
