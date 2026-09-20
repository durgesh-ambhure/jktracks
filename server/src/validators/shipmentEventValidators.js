const Joi = require('joi');

const createEvent = Joi.object({
  date: Joi.date().optional(),
  time: Joi.string().trim().allow('', null),
  status: Joi.string().trim().required(),
  reasonCode: Joi.string().trim().allow('', null),
  location: Joi.string().trim().allow('', null),
  statusDetails: Joi.string().trim().allow('', null)
});

module.exports = { createEvent };
