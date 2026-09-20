const GenericRecord = require('../models/GenericRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

/**
 * SHORTCUT (Tier 2): generic list/create/get/update/delete controller
 * backing Masters, Invoices, Payments, KYC, Accounting and Settings.
 * `resolveType(req)` produces the GenericRecord.type value that scopes
 * each module/sub-key (e.g. "masters:zones", "invoices", "accounting:journal",
 * "settings:company-profile"). Full field-level validation/business logic
 * per module is a documented TODO — see FEATURES.md for what each of
 * these should eventually do.
 */
function makeGenericController(resolveType, entityLabel) {
  const list = asyncHandler(async (req, res) => {
    const type = resolveType(req);
    const { page, limit, skip, sort } = buildListQuery(req.query, []);
    const filter = { type };
    if (req.query.search) {
      filter.label = new RegExp(req.query.search, 'i');
    }

    const [items, total] = await Promise.all([
      GenericRecord.find(filter).sort(sort).skip(skip).limit(limit),
      GenericRecord.countDocuments(filter)
    ]);

    sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
  });

  const getOne = asyncHandler(async (req, res) => {
    const type = resolveType(req);
    const record = await GenericRecord.findOne({ _id: req.params.id, type });
    if (!record) throw ApiError.notFound(`${entityLabel} record not found`);
    sendSuccess(res, { data: record });
  });

  const create = asyncHandler(async (req, res) => {
    const type = resolveType(req);
    const record = await GenericRecord.create({
      type,
      data: req.body,
      label: req.body.label || req.body.name || '',
      createdBy: req.user?.id
    });

    await logAction(req, {
      action: 'INSERT',
      entity: entityLabel,
      entityId: record._id,
      formName: type,
      actionDescription: `Created ${entityLabel} record (${type})`
    });

    sendSuccess(res, { message: `${entityLabel} created`, data: record, statusCode: 201 });
  });

  const update = asyncHandler(async (req, res) => {
    const type = resolveType(req);
    const record = await GenericRecord.findOne({ _id: req.params.id, type });
    if (!record) throw ApiError.notFound(`${entityLabel} record not found`);

    record.data = { ...record.data, ...req.body };
    if (req.body.label || req.body.name) record.label = req.body.label || req.body.name;
    await record.save();

    await logAction(req, {
      action: 'UPDATE',
      entity: entityLabel,
      entityId: record._id,
      formName: type,
      actionDescription: `Updated ${entityLabel} record (${type})`
    });

    sendSuccess(res, { message: `${entityLabel} updated`, data: record });
  });

  const remove = asyncHandler(async (req, res) => {
    const type = resolveType(req);
    const record = await GenericRecord.findOne({ _id: req.params.id, type });
    if (!record) throw ApiError.notFound(`${entityLabel} record not found`);

    await record.deleteOne();

    await logAction(req, {
      action: 'DELETE',
      entity: entityLabel,
      entityId: record._id,
      formName: type,
      actionDescription: `Deleted ${entityLabel} record (${type})`
    });

    sendSuccess(res, { message: `${entityLabel} deleted`, data: {} });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { makeGenericController };
