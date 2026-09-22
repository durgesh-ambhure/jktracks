const Joi = require('joi');

// role is no longer restricted to a fixed enum (custom groups via User Group) — existence
// against the Role collection is checked in userController.js instead.
const createUser = Joi.object({
  userCode: Joi.string().trim().optional(),
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().trim().required(),
  companyCode: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional()
});

const updateUser = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  role: Joi.string().trim(),
  companyCode: Joi.string().trim(),
  isActive: Joi.boolean(),
  password: Joi.string().min(6)
}).min(1);

module.exports = { createUser, updateUser };
