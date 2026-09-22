const express = require('express');
const VendorAccount = require('../models/VendorAccount');
const ClientVas = require('../models/ClientVas');
const { makeModelController } = require('../controllers/modelCrudController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createVendorAccount, updateVendorAccount,
  createClientVas, updateClientVas
} = require('../validators/vendorClientDetailValidators');

const vendorAccountRouter = express.Router();
const vendorAccountController = makeModelController(VendorAccount, { entityLabel: 'Vendor Account', populate: ['vendorId'] });
vendorAccountRouter.use(authenticate);
vendorAccountRouter.get('/', requirePermission('couriers.read'), vendorAccountController.list);
vendorAccountRouter.post('/', requirePermission('couriers.update'), validate(createVendorAccount), vendorAccountController.create);
vendorAccountRouter.get('/:id', requirePermission('couriers.read'), vendorAccountController.getOne);
vendorAccountRouter.patch('/:id', requirePermission('couriers.update'), validate(updateVendorAccount), vendorAccountController.update);
vendorAccountRouter.delete('/:id', requirePermission('couriers.update'), vendorAccountController.remove);

const clientVasRouter = express.Router();
const clientVasController = makeModelController(ClientVas, { entityLabel: 'Client VAS', populate: ['clientId'] });
clientVasRouter.use(authenticate);
clientVasRouter.get('/', requirePermission('customers.read'), clientVasController.list);
clientVasRouter.post('/', requirePermission('customers.update'), validate(createClientVas), clientVasController.create);
clientVasRouter.get('/:id', requirePermission('customers.read'), clientVasController.getOne);
clientVasRouter.patch('/:id', requirePermission('customers.update'), validate(updateClientVas), clientVasController.update);
clientVasRouter.delete('/:id', requirePermission('customers.update'), clientVasController.remove);

module.exports = { vendorAccountRouter, clientVasRouter };
