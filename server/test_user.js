require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
(async() => {
  try {
    const id = require('crypto').randomUUID();
    const token = require('jsonwebtoken').sign({ id, role: 'user' }, process.env.JWT_SECRET || 'buywise_secure_production_jwt_984827358_mno');
    
    try {
      await db.query("INSERT INTO users (id, name, email, free_report_used, role) VALUES ($1, 'Test User', 'test2@example.com', false, 'user')", [id]);
      console.log('JWT:', token);
      console.log('Test user created', id);
    } catch(e) {
      if (e.message.includes('unique constraint')) {
         const u = await db.query("SELECT id FROM users WHERE email='test2@example.com'");
         const uid = u.rows[0].id;
         const token2 = require('jsonwebtoken').sign({ id: uid, role: 'user' }, process.env.JWT_SECRET || 'buywise_secure_production_jwt_984827358_mno');
         await db.query("UPDATE users SET free_report_used = false WHERE id = $1", [uid]);
         console.log('JWT:', token2);
      } else throw e;
    }
    process.exit(0);
  } catch(e) {
    console.error(e); process.exit(1);
  }
})();
