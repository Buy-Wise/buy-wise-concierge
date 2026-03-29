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
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/forms', formRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
