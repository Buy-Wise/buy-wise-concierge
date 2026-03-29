/**
 * End-to-End Test: Laptop Research in Tamil
 * - Uses existing user srinivasanswaminathan589@gmail.com
 * - Bypasses payment
 * - Triggers full Gemini AI research pipeline
 * - Generates downloadable PDF
 */
require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const crypto = require('crypto');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

(async () => {
  try {
    const email = 'srinivasanswaminathan589@gmail.com';

    // 1. Find or verify the user
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.error('❌ User not found:', email);
      console.log('Please register the user first at http://localhost:5173/register');
      process.exit(1);
    }
    const user = userRes.rows[0];
    console.log('✅ Found user:', user.name, '| ID:', user.id);

    // 2. Update language preference to Tamil
    await db.query('UPDATE users SET language_preference = $1 WHERE id = $2', ['TA', user.id]);
    console.log('✅ Language set to Tamil (TA)');

    // 3. Create order (bypass payment)
    const orderId = crypto.randomUUID();
    await db.query(
      `INSERT INTO orders (id, user_id, product_category, service_tier, amount, status, razorpay_payment_id, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, user.id, 'LAPTOP', 'PRO', 34900, 'PAID', 'test_bypass_' + Date.now(), 'test_order_' + Date.now()]
    );
    console.log('✅ Created PAID order:', orderId);

    // 4. Create intake form
    await db.query(
      `INSERT INTO intake_forms (order_id, budget_range, brand_preferences, primary_use, must_have_features, deal_breakers, purchase_timeline, additional_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, '₹50,000 - ₹80,000', 'Apple, Lenovo, HP', 'Programming, Web Development, Cloud computing',
       'Good keyboard, 16GB+ RAM, SSD 512GB+, Long battery life',
       'Heavy weight, Bad display, Less than 8GB RAM',
       'Within 2 weeks',
       'I want a laptop that is good for coding and browsing. I travel a lot so battery life is very important. I prefer lightweight laptops under 1.5kg.']
    );
    console.log('✅ Created intake form with laptop preferences');

    // 5. Trigger the full Gemini AI pipeline
    console.log('\n🚀 Starting Gemini AI research pipeline...');
    console.log('📝 Language: Tamil (TA)');
    console.log('💻 Category: LAPTOP | Tier: PRO');
    console.log('⏳ This may take 30-60 seconds...\n');

    await runAutoGenerationPipeline(orderId);

    // 6. Check the result
    const orderResult = await db.query('SELECT status, pdf_url FROM orders WHERE id = $1', [orderId]);
    const reportResult = await db.query('SELECT id, pdf_url FROM reports WHERE order_id = $1', [orderId]);

    console.log('\n========== RESULT ==========');
    console.log('Order Status:', orderResult.rows[0]?.status);
    console.log('Order PDF URL:', orderResult.rows[0]?.pdf_url);
    console.log('Report PDF URL:', reportResult.rows[0]?.pdf_url);
    console.log('============================\n');

    if (orderResult.rows[0]?.status === 'DELIVERED') {
      console.log('🎉 SUCCESS! Report generated and PDF ready for download.');
      console.log('📥 Download at: http://localhost:3000' + (orderResult.rows[0]?.pdf_url || reportResult.rows[0]?.pdf_url));
      console.log('\n👤 User login: http://localhost:5173/login');
      console.log('   Email:', email);
      console.log('   Password: Srinivasan@2109');
      console.log('\n🔧 Admin login: http://localhost:5173/login');
      console.log('   Email: buywiseconcierge@gmail.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('⚠️  Order status:', orderResult.rows[0]?.status);
      const errRes = await db.query('SELECT last_error FROM orders WHERE id = $1', [orderId]);
      if (errRes.rows[0]?.last_error) console.log('Error:', errRes.rows[0].last_error);
    }

  } catch (e) {
    console.error('❌ Pipeline error:', e.message);
  }
  process.exit(0);
})();
