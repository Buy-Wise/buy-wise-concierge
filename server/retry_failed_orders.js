/**
 * Retry all GENERATION_FAILED and stuck orders
 * Run once after the pipeline fix to recover all failed reports
 */
require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

(async () => {
  console.log('=== Retrying All Failed Orders ===\n');
  
  try {
    // Get all failed/stuck orders that have intake forms
    const failed = await db.query(`
      SELECT o.id, o.product_category, o.service_tier, o.status, u.email, u.name,
             o.created_at
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN intake_forms f ON f.order_id = o.id
      WHERE o.status IN ('GENERATION_FAILED', 'GENERATING')
        AND f.id IS NOT NULL
      ORDER BY o.created_at ASC
    `);
    
    console.log(`Found ${failed.rows.length} order(s) to retry\n`);
    
    if (failed.rows.length === 0) {
      console.log('✅ No failed orders — all clear!');
      process.exit(0);
    }
    
    for (const order of failed.rows) {
      console.log(`\n--- Retrying Order ${order.id.slice(0,8)} ---`);
      console.log(`  User: ${order.name} (${order.email})`);
      console.log(`  Category: ${order.product_category}, Tier: ${order.service_tier}`);
      console.log(`  Previous status: ${order.status}`);
      
      // Reset status to PAID so pipeline can run
      await db.query("UPDATE orders SET status = 'PAID', last_error = NULL WHERE id = $1", [order.id]);
      
      try {
        console.log('  🚀 Starting pipeline...');
        await runAutoGenerationPipeline(order.id);
        
        const result = await db.query('SELECT status FROM orders WHERE id = $1', [order.id]);
        const rpt = await db.query('SELECT pdf_url FROM reports WHERE order_id = $1', [order.id]);
        
        if (result.rows[0]?.status === 'DELIVERED') {
          console.log(`  ✅ SUCCESS! PDF: ${rpt.rows[0]?.pdf_url}`);
        } else {
          console.log(`  ⚠️ Status after pipeline: ${result.rows[0]?.status}`);
        }
      } catch (e) {
        console.error(`  ❌ Pipeline crashed for ${order.id.slice(0,8)}:`, e.message.substring(0, 150));
      }
      
      // Wait 5s between orders to avoid rate limits
      if (failed.rows.indexOf(order) < failed.rows.length - 1) {
        console.log('  Waiting 5s before next order...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    
    console.log('\n=== Retry Batch Complete ===');
    process.exit(0);
  } catch (e) {
    console.error('❌ Batch retry crashed:', e.message);
    process.exit(1);
  }
})();
