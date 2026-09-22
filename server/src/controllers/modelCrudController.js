const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

/**
 * Real-model counterpart to genericController.js's makeGenericController — same list/create/
 * getOne/update/remove shape and same conventions (asyncHandler, ApiError, sendSuccess/sendList,
 * logAction), but backed by an actual Mongoose model with a real schema instead of the
 * GenericRecord Mixed-blob shortcut. Used for the rate-card cluster, vendor account detail,
 * client VAS detail, etc. — resources that need real field-level validation but are still
 * simple CRUD, so a bespoke controller per module would just be duplication.
 *
 * `extraFilters(req)` lets a route add fixed/derived filter fields (e.g. partyType) on top of
 * the search/pagination query.
 */
function makeModelController(Model, { entityLabel, searchFields = [], populate = [], extraFilters } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip, filter, sort } = buildListQuery(req.query, searchFields);
    Object.assign(filter, extraFilters ? extraFilters(req) : {});

    let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
    populate.forEach((p) => { query = query.populate(p); });

    const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
    sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => { query = query.populate(p); });
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${entityLabel} not found`);
    sendSuccess(res, { data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create({ ...req.body, createdBy: req.user?.id });
    await logAction(req, {
      action: 'INSERT',
      entity: entityLabel,
      entityId: doc._id,
      formName: entityLabel,
      actionDescription: `Created ${entityLabel} record`
    });
    sendSuccess(res, { message: `${entityLabel} created`, data: doc, statusCode: 201 });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound(`${entityLabel} not found`);
    Object.assign(doc, req.body);
    await doc.save();
    await logAction(req, {
      action: 'UPDATE',
      entity: entityLabel,
      entityId: doc._id,
      formName: entityLabel,
      actionDescription: `Updated ${entityLabel} record`
    });
    sendSuccess(res, { message: `${entityLabel} updated`, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound(`${entityLabel} not found`);
    await doc.deleteOne();
    await logAction(req, {
      action: 'DELETE',
      entity: entityLabel,
      entityId: doc._id,
      formName: entityLabel,
      actionDescription: `Deleted ${entityLabel} record`
    });
    sendSuccess(res, { message: `${entityLabel} deleted`, data: {} });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { makeModelController };
