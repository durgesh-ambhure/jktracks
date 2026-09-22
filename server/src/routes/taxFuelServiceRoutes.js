const express = require('express');
const ClientTaxRate = require('../models/ClientTaxRate');
const VendorFuelSurcharge = require('../models/VendorFuelSurcharge');
const VendorServiceConfig = require('../models/VendorServiceConfig');
const { makeModelController } = require('../controllers/modelCrudController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createClientTaxRate, updateClientTaxRate,
  createFuelSurcharge, updateFuelSurcharge,
  createServiceConfig, updateServiceConfig
} = require('../validators/taxFuelServiceValidators');

const taxRateRouter = express.Router();
const taxRateController = makeModelController(ClientTaxRate, { entityLabel: 'Client Tax Rate', populate: ['clientId'] });
taxRateRouter.use(authenticate);
taxRateRouter.get('/', requirePermission('invoices.read'), taxRateController.list);
taxRateRouter.post('/', requirePermission('invoices.update'), validate(createClientTaxRate), taxRateController.create);
taxRateRouter.get('/:id', requirePermission('invoices.read'), taxRateController.getOne);
taxRateRouter.patch('/:id', requirePermission('invoices.update'), validate(updateClientTaxRate), taxRateController.update);
taxRateRouter.delete('/:id', requirePermission('invoices.update'), taxRateController.remove);

const fuelSurchargeRouter = express.Router();
const fuelSurchargeController = makeModelController(VendorFuelSurcharge, { entityLabel: 'Vendor Fuel Surcharge', populate: ['vendorId'] });
fuelSurchargeRouter.use(authenticate);
fuelSurchargeRouter.get('/', requirePermission('invoices.read'), fuelSurchargeController.list);
fuelSurchargeRouter.post('/', requirePermission('invoices.update'), validate(createFuelSurcharge), fuelSurchargeController.create);
fuelSurchargeRouter.get('/:id', requirePermission('invoices.read'), fuelSurchargeController.getOne);
fuelSurchargeRouter.patch('/:id', requirePermission('invoices.update'), validate(updateFuelSurcharge), fuelSurchargeController.update);
fuelSurchargeRouter.delete('/:id', requirePermission('invoices.update'), fuelSurchargeController.remove);

const serviceConfigRouter = express.Router();
const serviceConfigController = makeModelController(VendorServiceConfig, { entityLabel: 'Vendor Service Configuration', populate: ['vendorId'] });
serviceConfigRouter.use(authenticate);
serviceConfigRouter.get('/', requirePermission('couriers.read'), serviceConfigController.list);
serviceConfigRouter.post('/', requirePermission('couriers.update'), validate(createServiceConfig), serviceConfigController.create);
serviceConfigRouter.get('/:id', requirePermission('couriers.read'), serviceConfigController.getOne);
serviceConfigRouter.patch('/:id', requirePermission('couriers.update'), validate(updateServiceConfig), serviceConfigController.update);
serviceConfigRouter.delete('/:id', requirePermission('couriers.update'), serviceConfigController.remove);

module.exports = { taxRateRouter, fuelSurchargeRouter, serviceConfigRouter };
