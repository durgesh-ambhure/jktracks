const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', requirePermission('users.read'), roleController.listRoles);
router.post('/', requirePermission('users.update'), roleController.createRole);
router.patch('/:name', requirePermission('users.update'), roleController.updateRole);
router.delete('/:name', requirePermission('users.update'), roleController.deleteRole);

module.exports = router;
