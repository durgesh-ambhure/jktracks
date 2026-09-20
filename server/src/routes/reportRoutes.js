const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/sales', requirePermission('reports.read'), reportController.salesReport);
router.get('/booking-summary', requirePermission('reports.read'), reportController.bookingSummary);
router.get('/vendor-contribution', requirePermission('reports.read'), reportController.vendorContribution);
router.get('/trend', requirePermission('reports.read'), reportController.trendReport);
router.get('/user-logs', requirePermission('reports.read'), reportController.userLogs);
router.get('/client-outstanding', requirePermission('reports.read'), reportController.clientOutstanding);

module.exports = router;
