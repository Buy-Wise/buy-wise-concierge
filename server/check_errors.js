require('dotenv').config({ path: '../.env' });
const db = require('./config/db');

async function checkErrors() {
  try {
    const result = await db.query("SELECT id, status, last_error, pdf_url FROM orders WHERE created_at > NOW() - INTERVAL '24 hours'");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

checkErrors();
