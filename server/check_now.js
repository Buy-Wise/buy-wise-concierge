const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRecentOrders() {
  try {
    const res = await pool.query("SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC");
    let out = `Orders in last 24 hours: ${res.rows.length}\n`;
    res.rows.forEach(r => {
      out += `ID: ${r.id}, Status: ${r.status}, PayID: ${r.razorpay_payment_id}, Created: ${r.created_at}\n`;
    });
    fs.writeFileSync('order_log.txt', out);
    console.log('Log written to order_log.txt');
  } catch (err) {
    fs.writeFileSync('order_log.txt', 'Check failed: ' + err.message);
  } finally {
    await pool.end();
  }
}

checkRecentOrders();
