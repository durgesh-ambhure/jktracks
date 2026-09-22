const express = require('express');
const { makeGenericController } = require('../controllers/genericController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Tier 2 shortcut — see genericController.js.
const controller = makeGenericController(() => 'manifests', 'Transfer Manifest');

router.use(authenticate);

router.get('/', requirePermission('manifests.read'), controller.list);
router.post('/', requirePermission('manifests.create'), controller.create);
router.get('/:id', requirePermission('manifests.read'), controller.getOne);
router.patch('/:id', requirePermission('manifests.update'), controller.update);
router.delete('/:id', requirePermission('manifests.delete'), controller.remove);

module.exports = router;
