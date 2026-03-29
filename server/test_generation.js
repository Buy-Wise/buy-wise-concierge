require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

async function createTestReport(language, name) {
  try {
    // 1. Create a user with specified language
    const userResult = await db.query(
      `INSERT INTO users (name, email, language_preference, role) 
       VALUES ($1, $2, $3, 'user') RETURNING id`,
      [name, `test_${language.toLowerCase()}_${Date.now()}@example.com`, language]
    );
    const userId = userResult.rows[0].id;

    // 2. Create an order bypassed from payment
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, service_tier, product_category, status, amount) 
       VALUES ($1, 'PRO', 'LAPTOP', 'PAID', 9900) RETURNING id`,
      [userId]
    );
    const orderId = orderResult.rows[0].id;

    // 3. Create intake form
    await db.query(
      `INSERT INTO intake_forms (order_id, budget_min, budget_max, primary_use_case, preferences, priority_factors) 
       VALUES ($1, 50000, 80000, 'Programming and Data Science', '16GB RAM, Good battery', 'Performance, Battery')`,
      [orderId]
    );

    console.log(`Created mock data for ${language}. Order ID: ${orderId}`);

    // 4. Run the generation pipeline which uses Gemini
    console.log(`Starting auto generation pipeline for order ${orderId}...`);
    await runAutoGenerationPipeline(orderId);

    // 5. Fetch the result
    const reportResult = await db.query('SELECT pdf_url FROM reports WHERE order_id = $1', [orderId]);
    if (reportResult.rows.length > 0) {
      console.log(`[SUCCESS] ${language} Report generated. PDF URL: ${reportResult.rows[0].pdf_url}`);
    } else {
      console.log(`[FAILED] ${language} Report not found in DB.`);
      const errorResult = await db.query('SELECT last_error FROM orders WHERE id = $1', [orderId]);
      console.log(`Error from order: ${errorResult.rows[0].last_error}`);
    }

  } catch (err) {
    console.error(`Error for ${language}:`, err);
  }
}

async function runTests() {
  console.log('--- Testing Tamil Report ---');
  await createTestReport('TA', 'Tamil User');
  
  console.log('\n--- Testing Hindi Report ---');
  await createTestReport('HI', 'Hindi User');
  
  process.exit(0);
}

runTests();
