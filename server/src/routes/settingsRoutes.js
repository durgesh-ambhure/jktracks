const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — sub-keys: company-profile | plan | payment-history |
// profile | table-page-size | mail-sms-format. See genericController.js.
const controller = makeGenericController((req) => `settings:${req.params.key}`, 'Settings');

router.use(authenticate);

router.get('/:key', requirePermission('settings.read'), controller.list);
router.post('/:key', requirePermission('settings.update'), controller.create);
router.get('/:key/:id', requirePermission('settings.read'), controller.getOne);
router.patch('/:key/:id', requirePermission('settings.update'), controller.update);
router.delete('/:key/:id', requirePermission('settings.delete'), controller.remove);

module.exports = router;
