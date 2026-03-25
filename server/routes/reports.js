const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/generate/:orderId', verifyToken, isAdmin, reportController.generateReport);
router.post('/generate-pdf/:orderId', verifyToken, isAdmin, reportController.generatePDFRoute);
router.post('/send-whatsapp/:orderId', verifyToken, isAdmin, reportController.sendViaWhatsApp);
router.get('/:orderId', verifyToken, reportController.getReport);

module.exports = router;
