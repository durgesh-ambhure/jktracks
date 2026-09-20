const GenericRecord = require('../models/GenericRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

/**
 * SHORTCUT (Tier 2 — Excel Import): accepts a multipart file upload via
 * multer, stores only metadata (original name, stored path, size, mime,
 * the import "key" e.g. client-rate/vendor-rate/zone/etc.) as a
 * GenericRecord of type `imports:<key>`, and returns a stub "processed"
 * response. Real parsing/validation/commit (per FEATURES.md "Import
 * (Excel)": upload -> server-side parse & validate -> preview errors ->
 * commit) is a documented TODO for a future pass.
 */

const listImports = asyncHandler(async (req, res) => {
  const type = `imports:${req.params.key}`;
  const { page, limit, skip, sort } = buildListQuery(req.query, []);
  const filter = { type };

  const [items, total] = await Promise.all([
    GenericRecord.find(filter).sort(sort).skip(skip).limit(limit),
    GenericRecord.countDocuments(filter)
  ]);

  sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
});

const uploadImport = asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded (expected multipart field "file")');
  }

  const record = await GenericRecord.create({
    type: `imports:${key}`,
    label: req.file.originalname,
    data: {
      key,
      originalName: req.file.originalname,
      storedFileName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      status: 'STUB_PROCESSED',
      note: 'Parsing/validation not implemented in this pass (documented TODO).'
    },
    createdBy: req.user?.id
  });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Import',
    entityId: record._id,
    formName: `imports:${key}`,
    actionDescription: `Uploaded import file '${req.file.originalname}' for ${key}`
  });

  sendSuccess(res, {
    message: 'File uploaded and queued (stub processing only)',
    data: record,
    statusCode: 201
  });
});

module.exports = { listImports, uploadImport };
