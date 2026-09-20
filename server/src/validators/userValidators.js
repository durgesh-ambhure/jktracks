const Joi = require('joi');
const { ROLE_NAMES } = require('../models/Role');

const createUser = Joi.object({
  userCode: Joi.string().trim().optional(),
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...ROLE_NAMES).required(),
  companyCode: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional()
});

const updateUser = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  role: Joi.string().valid(...ROLE_NAMES),
  companyCode: Joi.string().trim(),
  isActive: Joi.boolean(),
  password: Joi.string().min(6)
}).min(1);

module.exports = { createUser, updateUser };
