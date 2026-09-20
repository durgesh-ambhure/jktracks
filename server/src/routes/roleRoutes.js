const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', requirePermission('users.read'), roleController.listRoles);
router.patch('/:name', requirePermission('users.update'), roleController.updateRole);

module.exports = router;
