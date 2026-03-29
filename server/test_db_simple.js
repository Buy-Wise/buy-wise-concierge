const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

console.log('Testing DB connection to:', process.env.DATABASE_URL.substring(0, 30) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success! Database time:', res.rows[0].now);
  } catch (err) {
    console.error('DB Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();
