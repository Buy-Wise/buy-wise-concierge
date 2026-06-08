const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,                        // Free-tier: limit maximum active connections
  idleTimeoutMillis: 30000,      // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000 // Return an error if connection takes longer than 10 seconds
});

// CRITICAL: Prevent unhandled process exit if an idle database client loses connection
pool.on('error', (err) => {
  console.error('ALERT: Unexpected idle database client connection error caught safely:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // export raw pool for testing or transactions if needed
};

