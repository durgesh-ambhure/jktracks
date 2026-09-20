const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/summary', requirePermission('dashboard.read'), dashboardController.getSummary);

module.exports = router;
