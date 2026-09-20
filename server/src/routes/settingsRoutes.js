const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — sub-keys: profile | table-page-size | mail-sms-format.
// (company-profile/company-ledger/plan removed: this deployment is a single
// dedicated client's internal tool, not a multi-tenant/reseller SaaS
// instance, so franchise/subscription-billing settings don't apply.)
// See genericController.js.
const controller = makeGenericController((req) => `settings:${req.params.key}`, 'Settings');

router.use(authenticate);

router.get('/:key', requirePermission('settings.read'), controller.list);
router.post('/:key', requirePermission('settings.update'), controller.create);
router.get('/:key/:id', requirePermission('settings.read'), controller.getOne);
router.patch('/:key/:id', requirePermission('settings.update'), controller.update);
router.delete('/:key/:id', requirePermission('settings.delete'), controller.remove);

module.exports = router;
