const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/generate/:orderId', verifyToken, isAdmin, reportController.generateReport);
router.post('/generate-pdf/:orderId', verifyToken, isAdmin, reportController.generatePDFRoute);
router.post('/generate-auto', (req, res, next) => {
  const key = req.headers['x-internal-api-key'];
  const envKey = process.env.INTERNAL_API_KEY;
  // Only allow internal API key if it's actually set
  if (key && envKey && key === envKey) return next();
  // Otherwise require admin JWT
  verifyToken(req, res, () => isAdmin(req, res, next));
}, reportController.generateAuto);
router.get('/:orderId/status', verifyToken, reportController.getReportStatus);
router.get('/:orderId/download', verifyToken, reportController.downloadReport);
router.get('/sample-pdf', verifyToken, isAdmin, reportController.generateSamplePDF);
router.get('/:orderId', verifyToken, reportController.getReport);

module.exports = { router, generateReportV2: reportController.generatePDFRoute };
