require('dotenv').config({ path: '../.env' }); // or use default .env in server folder
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Allow localhost AND any Vercel domain for your frontend
    if (origin.startsWith('http://localhost') || origin.endsWith('vercel.app')) {
      return callback(null, true);
    }

    // Block anything else
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Serve static PDFs
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// --- DATABASE MIGRATION RUNNER ---
const db = require('./config/db');
async function runMigrations() {
  console.log('🚀 Running database migrations...');
  const queries = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_error TEXT;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;`,
    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);`,
    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS general_feedback TEXT;`,
    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS product_suggestion TEXT;`,
    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_prompt TEXT;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS raw_ai_output TEXT;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS formatted_report TEXT;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS pdf_url TEXT;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS budget_min DECIMAL(12,2);`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS budget_max DECIMAL(12,2);`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS primary_use_case TEXT;`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS preferences TEXT;`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS priority_factors TEXT;`,
    `ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS additional_notes TEXT;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS free_report_used BOOLEAN DEFAULT FALSE;`,
    // Drop the old check constraint and re-add it with FREE and REFUNDED statuses supported
    `DO $$ BEGIN
       IF EXISTS (
         SELECT 1 FROM information_schema.table_constraints
         WHERE constraint_name = 'orders_status_check' AND table_name = 'orders'
       ) THEN
         ALTER TABLE orders DROP CONSTRAINT orders_status_check;
       END IF;
     END $$;`,
    `ALTER TABLE orders ADD CONSTRAINT orders_status_check
       CHECK (status IN ('PENDING','PAID','FREE','GENERATING','DELIVERED','GENERATION_FAILED','CANCELLED','REFUNDED'))
       NOT VALID;`,
    // Ensure unique index on reports.order_id (silently ignore if duplicates exist in old data)
    `DO $$ BEGIN
       BEGIN
         CREATE UNIQUE INDEX IF NOT EXISTS reports_order_id_unique ON reports (order_id);
       EXCEPTION WHEN unique_violation OR others THEN
         NULL; -- Ignore if duplicate data prevents index creation
       END;
     END $$;`
  ];

  for (const sql of queries) {
    try {
      await db.query(sql);
    } catch (err) {
      // Ignore "already exists" errors if they happen for some reason, 
      // though ADD COLUMN IF NOT EXISTS should handle it.
      if (!err.message.includes('already exists')) {
        console.error(`❌ Migration Error (${sql.substring(0, 30)}...):`, err.message);
      }
    }
  }
  console.log('✅ Migrations complete.');
}
runMigrations();

// --- RAZORPAY CREDENTIAL CHECK AT STARTUP ---
async function checkRazorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId.startsWith('rzp_')) {
    console.warn('[RAZORPAY] ⚠️  No valid RAZORPAY_KEY_ID set — running in mock mode.');
    return;
  }
  try {
    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    // Fetch a non-existent order to validate credentials — 404 means auth OK, 401 means bad creds
    await rzp.orders.fetch('order_healthcheck_probe').catch(err => {
      if (err.statusCode === 404 || err.statusCode === 400) {
        console.log('[RAZORPAY] ✅ Credentials valid (authentication OK)');
      } else if (err.statusCode === 401) {
        console.error('[RAZORPAY] ❌ CREDENTIALS INVALID — orders.create will fail with 401!');
        console.error('[RAZORPAY] ❌ Fix: Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env');
      } else {
        console.warn(`[RAZORPAY] ⚠️  Unexpected probe response: HTTP ${err.statusCode}`);
      }
    });
  } catch (e) {
    console.warn('[RAZORPAY] ⚠️  Credential check error:', e.message || e);
  }
}
checkRazorpayCredentials();

// Routes imports
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
// const formRoutes = require('./routes/forms');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports').router;
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const alertRoutes = require('./routes/alerts');
const eventRoutes = require('./routes/events');

// Basic API check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Buy Wise API is running' });
});

// App Routes setup
console.log('🚀 Initializing API Routes...');
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
console.log('✅ All API Routes mounted.');

// --- GLOBAL JSON ERROR HANDLERS ---
// Catch 404 (Unmatched Routes)
app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found. This path does not exist on the server.',
    method: req.method,
    path: req.url 
  });
});

// Catch 500 (Unhandled Server Errors)
app.use((err, req, res, next) => {
  console.error('[500] Global Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
