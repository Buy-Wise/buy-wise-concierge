const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify-payment', verifyToken, paymentController.verifyPayment);
router.post('/verify', verifyToken, paymentController.verifyPayment); // Alias for backward compatibility
router.post('/webhook', paymentController.webhookVerify); 
router.get('/sync/:orderId', verifyToken, paymentController.syncPaymentStatus);

module.exports = router;
