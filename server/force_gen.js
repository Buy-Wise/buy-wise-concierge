const db = require('./config/db');
const { runAutoGenerationPipeline } = require('./controllers/reportController');
require('dotenv').config({ path: '../.env' });

const orderId = '86a71872-4853-46cf-a467-b816f0b6433d';

async function forceGenerate() {
  try {
    console.log(`Forcing generation for ${orderId}...`);
    // Manually set status to PAID first to simulate success
    await db.query("UPDATE orders SET status = 'PAID' WHERE id = $1", [orderId]);
    
    await runAutoGenerationPipeline(orderId);
    console.log('Force generation complete or started.');
  } catch (err) {
    console.error('Force generation failed:', err.message);
  } finally {
    process.exit();
  }
}

forceGenerate();
