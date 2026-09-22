const Joi = require('joi');

const createClientTaxRate = Joi.object({
  clientId: Joi.string().hex().length(24).required(),
  taxType: Joi.string().valid('CGST', 'SGST', 'IGST', 'GST').required(),
  percentage: Joi.number().min(0).max(100).required(),
  effectiveFrom: Joi.date().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});
const updateClientTaxRate = createClientTaxRate.fork(['clientId', 'taxType', 'percentage'], (s) => s.optional());

const createFuelSurcharge = Joi.object({
  vendorId: Joi.string().hex().length(24).required(),
  percentage: Joi.number().min(0).max(100).required(),
  effectiveFrom: Joi.date().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});
const updateFuelSurcharge = createFuelSurcharge.fork(['vendorId', 'percentage'], (s) => s.optional());

const createServiceConfig = Joi.object({
  vendorId: Joi.string().hex().length(24).required(),
  serviceType: Joi.string().trim().required(),
  enabled: Joi.boolean(),
  priority: Joi.number(),
  cutoffTime: Joi.string().trim().allow('', null),
  notes: Joi.string().trim().allow('', null)
});
const updateServiceConfig = createServiceConfig.fork(['vendorId', 'serviceType'], (s) => s.optional());

module.exports = {
  createClientTaxRate,
  updateClientTaxRate,
  createFuelSurcharge,
  updateFuelSurcharge,
  createServiceConfig,
  updateServiceConfig
};
