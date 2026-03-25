require('dotenv').config({ path: '../.env' }); // or use default .env in server folder
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes imports
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
// const formRoutes = require('./routes/forms');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const alertRoutes = require('./routes/alerts');

// Basic API check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Buy Wise API is running' });
});

// App Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/forms', formRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
