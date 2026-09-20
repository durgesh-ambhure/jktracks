const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Tier 2 shortcut: one flexible GenericRecord-backed CRUD for all master
// data keys (zones, charge-types, countries, states, cities, pincodes,
// oda-mapping, tracking-events, reasons, hsn). See genericController.js.
const controller = makeGenericController((req) => `masters:${req.params.key}`, 'Master');

router.use(authenticate);

router.get('/:key', requirePermission('masters.read'), controller.list);
router.post('/:key', requirePermission('masters.update'), controller.create);
router.get('/:key/:id', requirePermission('masters.read'), controller.getOne);
router.patch('/:key/:id', requirePermission('masters.update'), controller.update);
router.delete('/:key/:id', requirePermission('masters.delete'), controller.remove);

module.exports = router;
