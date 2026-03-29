/**
 * Master Stress Test Pipeline
 * Runs 3 distinct scenarios to verify:
 * 1. Gemini 1.5-flash reliability
 * 2. Language enforcement (Tamil/Hindi)
 * 3. Premium PDF generation with specific fonts
 */
require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const crypto = require('crypto');
const { runAutoGenerationPipeline } = require('./controllers/reportController');

const scenarios = [
  {
    name: "Scenario 1: Laptop PRO - Tamil",
    category: "LAPTOP",
    tier: "PRO",
    lang: "TA",
    email: "srinivasanswaminathan589@gmail.com",
    form: {
      budget_range: "₹60,000 - ₹90,000",
      primary_use: "Software Development, AI/ML, Cloud Architecture",
      must_have_features: "16GB RAM, 512GB SSD, Metal Build, High-res screen",
      deal_breakers: "Plastic body, heating issues",
      additional_notes: "I need a professional machine for my career in AI. Tamil language report please."
    }
  },
  {
    name: "Scenario 2: Phone BASIC - Hindi",
    category: "PHONE",
    tier: "BASIC",
    lang: "HI",
    email: "srinivasanswaminathan589@gmail.com",
    form: {
      budget_range: "₹15,000 - ₹25,000",
      primary_use: "Photography, Social Media, Long Battery Life",
      must_have_features: "Great camera, 5000mAh battery, Fast charging",
      deal_breakers: "Slow UI, poor low light photos",
      additional_notes: "I want the best camera in this budget. Hindi report please."
    }
  },
  {
    name: "Scenario 3: Tablet EXPRESS - Tamil",
    category: "TABLET",
    tier: "EXPRESS",
    lang: "TA",
    email: "srinivasanswaminathan589@gmail.com",
    form: {
      budget_range: "₹30,000 - ₹50,000",
      primary_use: "Digital Art, Note taking, Entertainment",
      must_have_features: "Stylus support, high refresh rate, 128GB+ storage",
      deal_breakers: "Dull screen, laggy stylus",
      additional_notes: "I am a student starting digital art. Tamil report."
    }
  }
];

async function runScenario(scenario) {
  console.log(`\n--- STARTING ${scenario.name} ---`);
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [scenario.email]);
    const userId = userRes.rows[0].id;

    // Update lang pref
    await db.query('UPDATE users SET language_preference = $1 WHERE id = $2', [scenario.lang, userId]);

    // Create Order
    const orderId = crypto.randomUUID();
    await db.query(
      `INSERT INTO orders (id, user_id, product_category, service_tier, amount, status, razorpay_payment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, userId, scenario.category, scenario.tier, 49900, 'PAID', 'stress_test_' + Date.now()]
    );

    // Create Form (handling schema)
    await db.query(
      `INSERT INTO intake_forms (order_id, budget_min, budget_max, primary_use_case, priority_factors, preferences, additional_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, 10000, 99999, scenario.form.primary_use, scenario.form.deal_breakers, scenario.form.must_have_features, scenario.form.additional_notes]
    );

    // Run Pipeline
    console.log(`🚀 Executing Pipeline for ${scenario.name}...`);
    await runAutoGenerationPipeline(orderId);

    // Verify
    const orderFinal = await db.query('SELECT status, last_error FROM orders WHERE id = $1', [orderId]);
    const reportFinal = await db.query('SELECT pdf_url FROM reports WHERE order_id = $1', [orderId]);

    console.log(`✅ ${scenario.name} Result: ${orderFinal.rows[0].status}`);
    if (orderFinal.rows[0].status !== 'DELIVERED') {
      console.error(`❌ ERROR: ${orderFinal.rows[0].last_error}`);
    } else {
      console.log(`📂 PDF: http://localhost:3000${reportFinal.rows[0].pdf_url}`);
    }
    return orderFinal.rows[0].status === 'DELIVERED';
  } catch (e) {
    console.error(`❌ FAILED ${scenario.name}:`, e.message);
    return false;
  }
}

async function start() {
  console.log("🌊 STARTING TRIPLE-PASS STRESS TEST 🌊");
  let passedCount = 0;
  for (const s of scenarios) {
    const ok = await runScenario(s);
    if (ok) passedCount++;
  }
  console.log(`\n🏆 STRESS TEST COMPLETE: ${passedCount}/${scenarios.length} PASSED`);
  process.exit(passedCount === scenarios.length ? 0 : 1);
}

start();
