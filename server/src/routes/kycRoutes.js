const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — see genericController.js.
const controller = makeGenericController(() => 'kyc', 'KYC');

router.use(authenticate);

router.get('/', requirePermission('kyc.read'), controller.list);
router.post('/', requirePermission('kyc.create'), controller.create);
router.get('/:id', requirePermission('kyc.read'), controller.getOne);
router.patch('/:id', requirePermission('kyc.update'), controller.update);
router.delete('/:id', requirePermission('kyc.delete'), controller.remove);

module.exports = router;
