const Joi = require('joi');

const createVendorAccount = Joi.object({
  vendorId: Joi.string().hex().length(24).required(),
  accountHolderName: Joi.string().trim().required(),
  bankName: Joi.string().trim().required(),
  accountNumber: Joi.string().trim().required(),
  ifscCode: Joi.string().trim().required(),
  branchName: Joi.string().trim().allow('', null),
  accountType: Joi.string().valid('SAVINGS', 'CURRENT'),
  isPrimary: Joi.boolean(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});
const updateVendorAccount = createVendorAccount.fork(
  ['vendorId', 'accountHolderName', 'bankName', 'accountNumber', 'ifscCode'],
  (s) => s.optional()
);

const createClientVas = Joi.object({
  clientId: Joi.string().hex().length(24).required(),
  vasName: Joi.string().trim().required(),
  rate: Joi.number().min(0).allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  effectiveFrom: Joi.date().allow('', null)
});
const updateClientVas = createClientVas.fork(['clientId', 'vasName'], (s) => s.optional());

module.exports = { createVendorAccount, updateVendorAccount, createClientVas, updateClientVas };
