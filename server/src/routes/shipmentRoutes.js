const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const shipmentEventController = require('../controllers/shipmentEventController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const shipmentValidators = require('../validators/shipmentValidators');
const shipmentEventValidators = require('../validators/shipmentEventValidators');

const router = express.Router();

router.use(authenticate);

// IMPORTANT: /export must be declared before /:id so it isn't captured
// as an id param.
router.get('/export', requirePermission('shipments.read'), shipmentController.exportShipments);

router.get('/', requirePermission('shipments.read'), shipmentController.listShipments);
router.post('/', requirePermission('shipments.create'), validate(shipmentValidators.createShipment), shipmentController.createShipment);
router.get('/:id', requirePermission('shipments.read'), shipmentController.getShipment);
router.patch('/:id', requirePermission('shipments.update'), validate(shipmentValidators.updateShipment), shipmentController.updateShipment);
router.delete('/:id', requirePermission('shipments.delete'), shipmentController.deleteShipment);
router.post('/:id/cancel', requirePermission('shipments.update'), validate(shipmentValidators.cancelShipment), shipmentController.cancelShipment);

router.get('/:id/events', requirePermission('shipments.read'), shipmentEventController.listEvents);
router.post('/:id/events', requirePermission('shipments.update'), validate(shipmentEventValidators.createEvent), shipmentEventController.createEvent);

module.exports = router;
