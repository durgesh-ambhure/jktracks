const Joi = require('joi');

const createCustomer = Joi.object({
  clientCode: Joi.string().trim().optional(),
  name: Joi.string().trim().required(),
  contactPerson: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  address1: Joi.string().trim().allow('', null),
  address2: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  state: Joi.string().trim().allow('', null),
  country: Joi.string().trim().allow('', null),
  pincode: Joi.string().trim().allow('', null),
  gstin: Joi.string().trim().allow('', null),
  pan: Joi.string().trim().allow('', null),
  creditLimit: Joi.number().min(0).default(0),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});

const updateCustomer = createCustomer.fork(['name'], (s) => s.optional()).min(1);

module.exports = { createCustomer, updateCustomer };
