const Joi = require('joi');

const createRateCard = Joi.object({
  partyType: Joi.string().valid('VENDOR', 'CLIENT').required(),
  vendorId: Joi.string().hex().length(24).when('partyType', { is: 'VENDOR', then: Joi.required(), otherwise: Joi.forbidden() }),
  clientId: Joi.string().hex().length(24).when('partyType', { is: 'CLIENT', then: Joi.required(), otherwise: Joi.forbidden() }),
  zone: Joi.string().trim().required(),
  serviceType: Joi.string().trim().allow('', null),
  weightFrom: Joi.number().min(0).required(),
  weightTo: Joi.number().min(0).required(),
  baseRate: Joi.number().min(0).required(),
  additionalRatePerKg: Joi.number().min(0).allow(null),
  currency: Joi.string().allow('', null),
  effectiveFrom: Joi.date().allow('', null),
  effectiveTo: Joi.date().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});

const updateRateCard = createRateCard.fork(['partyType', 'zone', 'weightFrom', 'weightTo', 'baseRate'], (s) => s.optional());

module.exports = { createRateCard, updateRateCard };
