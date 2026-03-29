const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/my', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.get('/user/:userId', verifyToken, orderController.getUserOrders);
router.patch('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;
