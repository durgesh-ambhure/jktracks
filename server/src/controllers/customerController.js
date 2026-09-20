const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

async function generateClientCode() {
  const count = await Client.countDocuments({});
  return `CL${String(count + 1).padStart(5, '0')}`;
}

const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, filter, sort } = buildListQuery(req.query, ['name', 'clientCode', 'email', 'phone']);
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Client.find(filter).sort(sort).skip(skip).limit(limit),
    Client.countDocuments(filter)
  ]);

  sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Client.findById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  sendSuccess(res, { data: customer });
});

const createCustomer = asyncHandler(async (req, res) => {
  const clientCode = req.body.clientCode || (await generateClientCode());
  const customer = await Client.create({ ...req.body, clientCode });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Client',
    entityId: customer._id,
    formName: 'Customers',
    actionDescription: `Created customer ${customer.name}`,
    refNo: customer.clientCode
  });

  sendSuccess(res, { message: 'Customer created', data: customer, statusCode: 201 });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Client.findById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');

  const previousValue = customer.toObject();
  Object.assign(customer, req.body);
  await customer.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'Client',
    entityId: customer._id,
    formName: 'Customers',
    actionDescription: `Updated customer ${customer.name}`,
    refNo: customer.clientCode,
    previousValue,
    newValue: req.body
  });

  sendSuccess(res, { message: 'Customer updated', data: customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Client.findById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');

  await customer.deleteOne();

  await logAction(req, {
    action: 'DELETE',
    entity: 'Client',
    entityId: customer._id,
    formName: 'Customers',
    actionDescription: `Deleted customer ${customer.name}`,
    refNo: customer.clientCode
  });

  sendSuccess(res, { message: 'Customer deleted', data: {} });
});

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
