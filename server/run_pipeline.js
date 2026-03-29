require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

(async () => {
  try {
    // 1. Check intake_forms schema
    const cols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'intake_forms' ORDER BY ordinal_position");
    console.log('intake_forms columns:', cols.rows.map(r => r.column_name).join(', '));

    const orderId = '9070e760-91f6-46f6-b8b3-2c6d656fbac9';

    // 2. Check if form exists
    const existing = await db.query('SELECT * FROM intake_forms WHERE order_id = $1', [orderId]);
    console.log('Existing form:', existing.rows.length > 0 ? 'YES' : 'NO');

    if (existing.rows.length === 0) {
      // Insert with correct column names
      const colNames = cols.rows.map(r => r.column_name);
      console.log('\nInserting intake form with columns:', colNames.join(', '));

      // Try inserting matching the exact schema
      if (colNames.includes('budget_range')) {
        await db.query(
          `INSERT INTO intake_forms (order_id, budget_range, brand_preferences, primary_use, must_have_features, deal_breakers, purchase_timeline, additional_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [orderId, '₹50,000 - ₹80,000', 'Apple, Lenovo, HP', 'Programming, Web Development',
           'Good keyboard, 16GB+ RAM, SSD 512GB+', 'Heavy weight, Bad display', 'Within 2 weeks',
           'Lightweight laptop for coding, battery life important']
        );
      } else if (colNames.includes('budget_min')) {
        await db.query(
          `INSERT INTO intake_forms (order_id, budget_min, budget_max, primary_use_case, priority_factors, preferences, additional_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, 50000, 80000, 'Programming, Web Development', 'Portability, Battery life',
           'Good keyboard, 16GB+ RAM, SSD 512GB+', 'Lightweight laptop for coding']
        );
      }
      console.log('✅ Intake form created');
    }

    // 3. Reset order to PAID and run pipeline
    await db.query("UPDATE orders SET status = 'PAID', last_error = NULL WHERE id = $1", [orderId]);
    console.log('✅ Order reset to PAID');
    console.log('\n🚀 Starting Gemini AI pipeline in Tamil...\n');

    await runAutoGenerationPipeline(orderId);

    // 4. Check result
    const check = await db.query('SELECT status, last_error FROM orders WHERE id = $1', [orderId]);
    const report = await db.query('SELECT pdf_url FROM reports WHERE order_id = $1', [orderId]);

    console.log('\n========== RESULT ==========');
    console.log('Status:', check.rows[0]?.status);
    console.log('Error:', check.rows[0]?.last_error || 'None');
    if (report.rows.length > 0) {
      console.log('PDF:', report.rows[0].pdf_url);
      console.log('Download: http://localhost:3000' + report.rows[0].pdf_url);
    }
    console.log('============================');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
  }
  process.exit(0);
})();
