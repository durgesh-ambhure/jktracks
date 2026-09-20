const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const customerValidators = require('../validators/customerValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('customers.read'), customerController.listCustomers);
router.post('/', requirePermission('customers.create'), validate(customerValidators.createCustomer), customerController.createCustomer);
router.get('/:id', requirePermission('customers.read'), customerController.getCustomer);
router.patch('/:id', requirePermission('customers.update'), validate(customerValidators.updateCustomer), customerController.updateCustomer);
router.delete('/:id', requirePermission('customers.delete'), customerController.deleteCustomer);

module.exports = router;
