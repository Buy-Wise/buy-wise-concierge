require('dotenv').config({ path: '../.env' });
process.on('uncaughtException', (errStr) => {
  console.error('UNCAUGHT EXCEPTION:', errStr);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const db = require('./config/db');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

async function repairAll() {
  try {
    console.log('--- Starting System Repair ---');
    // Find orders that are PAID but have no report, or are PENDING
    const result = await db.query(`
      SELECT o.id FROM orders o 
      WHERE o.created_at > NOW() - INTERVAL '24 hours'
    `);
    const orders = result.rows;
    
    console.log(`Found ${orders.length} orders to re-generate with Gemini.`);
    
    for (const order of orders) {
      console.log(`Processing Order: ${order.id}...`);
      // Clear existing report to force re-insert/update correctly
      await db.query("DELETE FROM reports WHERE order_id = $1", [order.id]);
      await db.query("UPDATE orders SET status = 'PAID' WHERE id = $1", [order.id]);
      
      // 2. Trigger Generation
      console.log(`Triggering AI Pipeline for ${order.id}...`);
      // We don't await here to run them in parallel/background if needed, 
      // but for a repair script we'll do one by one to avoid OpenAI rate limits.
      try {
        await runAutoGenerationPipeline(order.id);
        console.log(`Successfully started/finished pipeline for ${order.id}`);
      } catch (err) {
        console.error(`Pipeline failed for ${order.id}:`, err.message);
      }
    }
    
    console.log('--- Repair Complete ---');
  } catch (err) {
    console.error('Repair failed:', err.message);
  } finally {
    process.exit();
  }
}

repairAll();
