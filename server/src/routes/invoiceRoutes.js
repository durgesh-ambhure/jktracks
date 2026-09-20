const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — see genericController.js.
const controller = makeGenericController(() => 'invoices', 'Invoice');

router.use(authenticate);

router.get('/', requirePermission('invoices.read'), controller.list);
router.post('/', requirePermission('invoices.create'), controller.create);
router.get('/:id', requirePermission('invoices.read'), controller.getOne);
router.patch('/:id', requirePermission('invoices.update'), controller.update);
router.delete('/:id', requirePermission('invoices.delete'), controller.remove);

module.exports = router;
