const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — sub-keys: journal | receipt | ledger | outstanding.
// See genericController.js.
const controller = makeGenericController((req) => `accounting:${req.params.key}`, 'Accounting');

router.use(authenticate);

router.get('/:key', requirePermission('accounting.read'), controller.list);
router.post('/:key', requirePermission('accounting.update'), controller.create);
router.get('/:key/:id', requirePermission('accounting.read'), controller.getOne);
router.patch('/:key/:id', requirePermission('accounting.update'), controller.update);
router.delete('/:key/:id', requirePermission('accounting.delete'), controller.remove);

module.exports = router;
