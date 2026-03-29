require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const db = require('./config/db');

(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@buywise.com';
  const pw = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
  
  try {
    const hash = await bcrypt.hash(pw, 10);
    const exists = await db.query('SELECT id, role FROM users WHERE email = $1', [email]);
    
    if (exists.rows.length > 0) {
      await db.query('UPDATE users SET role = $1, password_hash = $2 WHERE email = $3', ['admin', hash, email]);
      console.log('✅ Updated existing user to admin:', email);
    } else {
      await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['BuyWise Admin', email, hash, 'admin']
      );
      console.log('✅ Created new admin user:', email);
    }
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', pw);
    console.log('🔗 Login at: http://localhost:5173/login');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
  process.exit(0);
})();
