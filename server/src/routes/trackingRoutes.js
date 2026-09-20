const express = require('express');
const trackingController = require('../controllers/trackingController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/:awb', requirePermission('tracking.read'), trackingController.trackByAwb);

module.exports = router;
