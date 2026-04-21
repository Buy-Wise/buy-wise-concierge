const { Pool } = require('pg');

const databaseUrl = 'postgresql://neondb_owner:v9r3ExuYI6S8@ep-cold-shadow-a1g8l091-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

const queries = [
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP WITH TIME ZONE;`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP WITH TIME ZONE;`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_error TEXT;`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;`,
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
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS free_report_used BOOLEAN DEFAULT FALSE;`
];

async function runMigration() {
  console.log('🚀 Starting direct schema synchronization with alternative password...');
  for (const sql of queries) {
    try {
      console.log(`Executing query...`);
      await pool.query(sql);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }
  console.log('✅ Done.');
  await pool.end();
}

runMigration().catch(console.error);
