const db = require('./config/db');
require('dotenv').config();

async function checkSchema() {
  try {
    const feedbackRows = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'feedback'");
    console.log('FEEDBACK_COLUMNS:', JSON.stringify(feedbackRows.rows, null, 2));
    
    const userRows = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log('USERS_COLUMNS:', JSON.stringify(userRows.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
