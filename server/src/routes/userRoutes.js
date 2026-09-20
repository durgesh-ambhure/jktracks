const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const userValidators = require('../validators/userValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('users.read'), userController.listUsers);
router.post('/', requirePermission('users.create'), validate(userValidators.createUser), userController.createUser);
router.get('/:id', requirePermission('users.read'), userController.getUser);
router.patch('/:id', requirePermission('users.update'), validate(userValidators.updateUser), userController.updateUser);
router.delete('/:id', requirePermission('users.delete'), userController.deleteUser);

module.exports = router;
