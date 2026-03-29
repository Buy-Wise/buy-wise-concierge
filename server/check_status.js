const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRecentOrders() {
  try {
    const res = await pool.query('SELECT id, status, razorpay_order_id, razorpay_payment_id, created_at, last_error FROM orders ORDER BY created_at DESC LIMIT 10');
    console.log('--- Recent 10 Orders ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkRecentOrders();
