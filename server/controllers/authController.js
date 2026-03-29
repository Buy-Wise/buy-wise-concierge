const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone_whatsapp } = req.body;

    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, phone_whatsapp) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, phone_whatsapp || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({ user, token }); // Keeping token in JSON optionally for clients that need it, but it's now in cookie too
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const insertResult = await db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, role',
        [name, email]
      );
      user = insertResult.rows[0];
    }

    const jwtToken = generateToken(user);
    setTokenCookie(res, jwtToken);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: jwtToken
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await db.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'If account exists, reset link sent' });
    }
    const user = result.rows[0];

    const resetToken = jwt.sign({ id: user.id, reset: true }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = require('nodemailer').createTransport({
      host: process.env.EMAIL_SERVICE_HOST,
      port: process.env.EMAIL_SERVICE_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Buy Wise Team" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: user.email,
      subject: `Reset Your Password - Buy Wise`,
      text: `Hi ${user.name},\n\nClick here to reset your password: ${resetLink}\n\nThis link expires in 15 minutes.\n\n— Buy Wise Team`
    });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.reset || !decoded.id) return res.status(400).json({ error: 'Invalid token' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, decoded.id]);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone_whatsapp, language_preference, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, language_preference, password } = req.body;

    let query = 'UPDATE users SET name = $1, language_preference = $2';
    const values = [name, language_preference];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query += ', password_hash = $3 WHERE id = $4 RETURNING id, name, email, language_preference';
      values.push(passwordHash, req.user.id);
    } else {
      query += ' WHERE id = $3 RETURNING id, name, email, language_preference';
      values.push(req.user.id);
    }

    const result = await db.query(query, values);
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
