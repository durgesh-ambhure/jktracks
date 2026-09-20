const Vendor = require('../models/Vendor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

// apiKey has `select:false` on the schema, so default finds already omit
// it. We never call `.select('+apiKey')` anywhere in this controller —
// this is the explicit-exclusion guarantee required by CONTRACT.md.
//
// The client only ever needs to know WHETHER a key is configured (to show a
// masked "Configured / Not configured" indicator), never the value itself.
// `hasApiKey` is computed via Vendor.exists({...}), which evaluates the
// $exists/$nin condition inside MongoDB and returns only a boolean-ish
// {_id} match — the key's plaintext never enters the Node process.
async function withHasApiKeyFlag(doc) {
  const obj = doc.toObject();
  delete obj.apiKey;
  const found = await Vendor.exists({ _id: doc._id, apiKey: { $exists: true, $nin: [null, ''] } });
  obj.hasApiKey = !!found;
  return obj;
}

async function generateVendorCode() {
  const count = await Vendor.countDocuments({});
  return `VN${String(count + 1).padStart(4, '0')}`;
}

const listCouriers = asyncHandler(async (req, res) => {
  const { page, limit, skip, filter, sort } = buildListQuery(req.query, ['name', 'vendorCode']);

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort(sort).skip(skip).limit(limit),
    Vendor.countDocuments(filter)
  ]);

  const withFlags = await Promise.all(items.map(withHasApiKeyFlag));

  sendList(res, { data: withFlags, pagination: buildPagination({ page, limit, total }) });
});

const getCourier = asyncHandler(async (req, res) => {
  const courier = await Vendor.findById(req.params.id);
  if (!courier) throw ApiError.notFound('Courier not found');
  sendSuccess(res, { data: await withHasApiKeyFlag(courier) });
});

const createCourier = asyncHandler(async (req, res) => {
  const vendorCode = req.body.vendorCode || (await generateVendorCode());
  const courier = await Vendor.create({ ...req.body, vendorCode });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Vendor',
    entityId: courier._id,
    formName: 'Couriers',
    actionDescription: `Created courier ${courier.name}`,
    refNo: courier.vendorCode
  });

  sendSuccess(res, { message: 'Courier created', data: await withHasApiKeyFlag(courier), statusCode: 201 });
});

const updateCourier = asyncHandler(async (req, res) => {
  const courier = await Vendor.findById(req.params.id);
  if (!courier) throw ApiError.notFound('Courier not found');

  const previousValue = courier.toObject();
  delete previousValue.apiKey;
  Object.assign(courier, req.body);
  await courier.save();

  const newValue = { ...req.body };
  delete newValue.apiKey;

  await logAction(req, {
    action: 'UPDATE',
    entity: 'Vendor',
    entityId: courier._id,
    formName: 'Couriers',
    actionDescription: `Updated courier ${courier.name}`,
    refNo: courier.vendorCode,
    previousValue,
    newValue
  });

  sendSuccess(res, { message: 'Courier updated', data: await withHasApiKeyFlag(courier) });
});

const deleteCourier = asyncHandler(async (req, res) => {
  const courier = await Vendor.findById(req.params.id);
  if (!courier) throw ApiError.notFound('Courier not found');

  await courier.deleteOne();

  await logAction(req, {
    action: 'DELETE',
    entity: 'Vendor',
    entityId: courier._id,
    formName: 'Couriers',
    actionDescription: `Deleted courier ${courier.name}`,
    refNo: courier.vendorCode
  });

  sendSuccess(res, { message: 'Courier deleted', data: {} });
});

module.exports = { listCouriers, getCourier, createCourier, updateCourier, deleteCourier };
