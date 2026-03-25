const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Initialize Razorpay
// Will fallback to mock values to prevent crash if env variables are not set yet
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, service_tier, product_category, formData } = req.body;
    const userId = req.user.id; // from auth middleware

    const options = {
      amount: amount, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    // If mock, we might just bypass Razorpay API call
    let razorpayOrder;
    if (process.env.RAZORPAY_KEY_ID) {
      razorpayOrder = await razorpay.orders.create(options);
    } else {
      // Mock Razorpay Order
      razorpayOrder = {
        id: `mock_order_${Date.now()}`,
        amount: amount,
        currency: "INR"
      };
    }

    // Create order in DB (Pending state)
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, service_tier, product_category, amount, razorpay_order_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, service_tier, product_category, amount, razorpayOrder.id]
    );
    const orderId = orderResult.rows[0].id;

    // Create intake form in DB
    await db.query(
      'INSERT INTO intake_forms (order_id, budget_min, budget_max, primary_use_case, preferences, priority_factors, additional_notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [orderId, formData.budget_min || 0, formData.budget_max || 0, formData.primary_use_case, formData.preferences, formData.priority_factors, formData.additional_notes]
    );

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      dbOrderId: orderId
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    let isAuthentic = false;

    if (process.env.RAZORPAY_KEY_SECRET) {
      // Create signature to verify
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
      
      isAuthentic = expectedSign === razorpay_signature;
    } else {
      // Accept mock payments if no secret is configured
      isAuthentic = true; 
    }

    if (isAuthentic) {
      // Payment is authentic
      await db.query(
        "UPDATE orders SET status = 'PAID', razorpay_payment_id = $1 WHERE id = $2 OR razorpay_order_id = $3",
        [razorpay_payment_id, dbOrderId, razorpay_order_id]
      );
      
      // TODO: Hook for Google Sheets Sync (FLOW 6)
      // TODO: Hook for Admin WhatsApp notification (FLOW 1)

      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Server error verifying payment' });
  }
};
