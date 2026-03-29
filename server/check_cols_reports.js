const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getCols() {
  try {
    const res = await pool.query('SELECT * FROM reports LIMIT 1');
    if (res.rows.length > 0) {
      console.log('Reports Columns:', Object.keys(res.rows[0]));
    } else {
      console.log('No reports found.');
    }
    
    // Check if unique constraint exists on order_id
    const constraints = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      JOIN pg_class ON conrelid = pg_class.oid 
      WHERE relname = 'reports'
    `);
    console.log('Constraints:', constraints.rows);
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await pool.end();
  }
}

getCols();
