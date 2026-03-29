require('dotenv').config({ path: '../.env' });
const db = require('./config/db');

(async () => {
  // Check columns
  const cols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
  console.log('Orders columns:', cols.rows.map(r => r.column_name).join(', '));
  
  const r = await db.query(`
    SELECT o.id, o.status, o.last_error, o.product_category, o.service_tier,
           u.language_preference, u.name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.email = 'srinivasanswaminathan589@gmail.com'
    ORDER BY o.created_at DESC LIMIT 1
  `);
  
  if (r.rows.length === 0) {
    console.log('No orders found for this user');
  } else {
    const o = r.rows[0];
    console.log('\nOrder ID:', o.id);
    console.log('Status:', o.status);
    console.log('Category:', o.product_category);
    console.log('Tier:', o.service_tier);
    console.log('Language:', o.language_preference);
    console.log('Error:', o.last_error || 'None');
    
    const rep = await db.query('SELECT id, pdf_url FROM reports WHERE order_id = $1', [o.id]);
    if (rep.rows.length > 0) {
      console.log('Report PDF:', rep.rows[0].pdf_url);
    } else {
      console.log('No report found');
    }
  }
  process.exit(0);
})();
