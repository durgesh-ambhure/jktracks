const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');
const { generateInvoice, voidAndRegenerateInvoice } = require('../services/invoiceGeneration.service');
const { generateIrnForInvoice, cancelIrnForInvoice } = require('../services/irnGeneration.service');

const listInvoices = asyncHandler(async (req, res) => {
  const { page, limit, skip, filter, sort } = buildListQuery(req.query, ['invoiceNo']);
  if (req.query.clientId) filter.clientId = req.query.clientId;
  if (req.query.invoiceType) filter.invoiceType = req.query.invoiceType;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.irnStatus) filter.irnStatus = req.query.irnStatus;

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort(sort).skip(skip).limit(limit).populate('clientId', 'name clientCode'),
    Invoice.countDocuments(filter)
  ]);

  sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('clientId', 'name clientCode')
    .populate('lineItems.shipmentId', 'awbNo');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  sendSuccess(res, { data: invoice });
});

// Backs "Generate Client Bill" (invoiceType STANDARD, the default), "Cash/ToPay Invoice"
// (TOPAY) and "Cargo Tax Invoice" (CARGO_TAX) — same endpoint, invoiceType in the body picks
// the shipment filter + tax logic (see invoiceGeneration.service.js).
const createInvoice = asyncHandler(async (req, res) => {
  const { clientId, fromDate, toDate, invoiceType } = req.body;
  const invoice = await generateInvoice({ clientId, fromDate, toDate, invoiceType, userId: req.user.id });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Invoice',
    entityId: invoice._id,
    formName: 'Invoices',
    actionDescription: `Generated invoice ${invoice.invoiceNo} (${invoice.invoiceType}) for client`,
    refNo: invoice.invoiceNo
  });

  sendSuccess(res, { message: 'Invoice generated', data: invoice, statusCode: 201 });
});

// Backs "Re-Generate Client Bill" — voids the existing invoice and creates a fresh one over
// the same client/date-range/type; never mutates or deletes the original (audit trail).
const regenerateInvoice = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const { original, reissued } = await voidAndRegenerateInvoice(req.params.id, { reason, userId: req.user.id });

  await logAction(req, {
    action: 'UPDATE',
    entity: 'Invoice',
    entityId: original._id,
    formName: 'Invoices',
    actionDescription: `Voided invoice ${original.invoiceNo} and reissued as ${reissued.invoiceNo}: ${reason}`,
    refNo: original.invoiceNo
  });

  sendSuccess(res, { message: `Invoice reissued as ${reissued.invoiceNo}`, data: { original, reissued } });
});

// Backs "Generate IRN" — real end to end via MockIrnProvider until NIC/GSP credentials are
// configured (see irn.factory.js).
const generateIrn = asyncHandler(async (req, res) => {
  const { invoice, success, message } = await generateIrnForInvoice(req.params.id);

  await logAction(req, {
    action: success ? 'IRN_GENERATED' : 'IRN_GENERATION_FAILED',
    entity: 'Invoice',
    entityId: invoice._id,
    formName: 'GenerateIrn',
    actionDescription: success ? `Generated IRN for invoice ${invoice.invoiceNo} (${invoice.irnProvider})` : `Failed to generate IRN for invoice ${invoice.invoiceNo}: ${message}`,
    refNo: invoice.invoiceNo
  });

  sendSuccess(res, {
    message,
    data: {
      success,
      invoiceId: invoice._id,
      irnStatus: invoice.irnStatus,
      irn: invoice.irn,
      ackNo: invoice.irnAckNo,
      ackDate: invoice.irnAckDate,
      signedQrCode: invoice.irnSignedQrCode,
      provider: invoice.irnProvider,
      error: invoice.irnError
    }
  });
});

const cancelIrn = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const { invoice, success, message } = await cancelIrnForInvoice(req.params.id, reason);

  await logAction(req, {
    action: success ? 'IRN_CANCELLED' : 'IRN_CANCELLATION_FAILED',
    entity: 'Invoice',
    entityId: invoice._id,
    formName: 'GenerateIrn',
    actionDescription: success ? `Cancelled IRN for invoice ${invoice.invoiceNo}: ${reason}` : `Failed to cancel IRN for invoice ${invoice.invoiceNo}: ${message}`,
    refNo: invoice.invoiceNo
  });

  sendSuccess(res, { message, data: { success, invoiceId: invoice._id, irnStatus: invoice.irnStatus, error: invoice.irnError } });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  await invoice.deleteOne();
  await logAction(req, {
    action: 'DELETE',
    entity: 'Invoice',
    entityId: invoice._id,
    formName: 'Invoices',
    actionDescription: `Deleted invoice ${invoice.invoiceNo}`,
    refNo: invoice.invoiceNo
  });
  sendSuccess(res, { message: 'Invoice deleted', data: {} });
});

module.exports = { listInvoices, getInvoice, createInvoice, regenerateInvoice, generateIrn, cancelIrn, deleteInvoice };
