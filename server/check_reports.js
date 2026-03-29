require('dotenv').config({ path: '../.env' });
const db = require('./config/db');

async function checkReports() {
  try {
    const result = await db.query(`
      SELECT o.id as order_id, o.status, r.pdf_url, r.is_available, o.last_error
      FROM orders o
      LEFT JOIN reports r ON o.id = r.order_id
      WHERE o.created_at > NOW() - INTERVAL '24 hours'
    `);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

checkReports();
