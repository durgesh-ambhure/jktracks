const express = require('express');
const VendorApiLog = require('../models/VendorApiLog');
const { makeModelController } = require('../controllers/modelCrudController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Read-only — these records are system-generated from shipmentForwarding.service.js, never
// created/edited/deleted through the API.
const controller = makeModelController(VendorApiLog, {
  entityLabel: 'Vendor API Log',
  searchFields: ['awbNo', 'vendorCode', 'action'],
  populate: []
});

router.use(authenticate);
router.get('/', requirePermission('shipments.read'), controller.list);
router.get('/:id', requirePermission('shipments.read'), controller.getOne);

module.exports = router;
