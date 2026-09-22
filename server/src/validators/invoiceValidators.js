const Joi = require('joi');

const createInvoice = Joi.object({
  clientId: Joi.string().hex().length(24).required(),
  fromDate: Joi.date().required(),
  toDate: Joi.date().required(),
  invoiceType: Joi.string().valid('STANDARD', 'TOPAY', 'CARGO_TAX')
});

const regenerateInvoice = Joi.object({
  reason: Joi.string().trim().required().messages({ 'string.empty': 'Reason is required' })
});

const cancelIrn = Joi.object({
  reason: Joi.string().trim().required().messages({ 'string.empty': 'Reason is required' })
});

module.exports = { createInvoice, regenerateInvoice, cancelIrn };
