const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — see genericController.js.
const controller = makeGenericController(() => 'payments', 'Payment');

router.use(authenticate);

router.get('/', requirePermission('payments.read'), controller.list);
router.post('/', requirePermission('payments.create'), controller.create);
router.get('/:id', requirePermission('payments.read'), controller.getOne);
router.patch('/:id', requirePermission('payments.update'), controller.update);
router.delete('/:id', requirePermission('payments.delete'), controller.remove);

module.exports = router;
