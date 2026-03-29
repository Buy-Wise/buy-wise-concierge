const crypto = require('crypto');
const fetch = require('node-fetch'); // May need to install or use http
require('dotenv').config({ path: '../.env' });

const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
const order_id = 'order_SW7oM6RChaiCQh'; // From the latest PENDING order in DB
const payment_id = 'pay_test_123';
const sign = order_id + "|" + payment_id;
const signature = crypto.createHmac("sha256", secret).update(sign).digest("hex");

console.log('Using Secret:', secret);
console.log('Generated Signature:', signature);

async function testVerify() {
  try {
    const res = await fetch('http://localhost:3000/api/payments/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: order_id,
        razorpay_payment_id: payment_id,
        razorpay_signature: signature,
        dbOrderId: '86a71872-4853-46cf-a467-b816f0b6433d'
      })
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

testVerify();
