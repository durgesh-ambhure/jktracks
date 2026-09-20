const Joi = require('joi');

const serviceType = Joi.object({
  name: Joi.string().trim().allow('', null),
  code: Joi.string().trim().allow('', null)
});

const createCourier = Joi.object({
  vendorCode: Joi.string().trim().optional(),
  name: Joi.string().trim().required(),
  apiUrl: Joi.string().uri().allow('', null),
  apiKey: Joi.string().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  serviceTypes: Joi.array().items(serviceType).default([]),
  trackingEnabled: Joi.boolean()
});

const updateCourier = createCourier.fork(['name'], (s) => s.optional()).min(1);

module.exports = { createCourier, updateCourier };
