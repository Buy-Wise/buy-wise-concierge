const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getCols() {
  try {
    const res = await pool.query('SELECT * FROM orders LIMIT 1');
    if (res.rows.length > 0) {
      console.log('Columns:', Object.keys(res.rows[0]));
      console.log('Values:', res.rows[0]);
    } else {
      console.log('No orders found.');
    }
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await pool.end();
  }
}

getCols();
