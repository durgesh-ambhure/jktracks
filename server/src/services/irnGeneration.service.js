const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');
const { getIrnProvider } = require('../integrations/irn/irn.factory');

async function generateIrnForInvoice(invoiceId) {
  const invoice = await Invoice.findById(invoiceId).populate('clientId', 'name clientCode gstin');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === 'VOIDED') throw ApiError.badRequest('Cannot generate an IRN for a voided invoice');
  if (invoice.irnStatus === 'GENERATED') throw ApiError.conflict('IRN has already been generated for this invoice');

  const { provider, providerName } = getIrnProvider();

  let result;
  try {
    result = await provider.generateIrn({
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.invoiceDate,
      amount: invoice.amount,
      buyerGstin: invoice.clientId?.gstin || null,
      lineItems: invoice.lineItems
    });
  } catch (err) {
    invoice.irnStatus = 'FAILED';
    invoice.irnError = err.message;
    invoice.irnProvider = providerName;
    await invoice.save();
    return { invoice, success: false, message: err.message };
  }

  if (!result.success) {
    invoice.irnStatus = 'FAILED';
    invoice.irnError = result.message;
    invoice.irnProvider = providerName;
    await invoice.save();
    return { invoice, success: false, message: result.message };
  }

  invoice.irnStatus = 'GENERATED';
  invoice.irn = result.irn;
  invoice.irnAckNo = result.ackNo;
  invoice.irnAckDate = result.ackDate;
  invoice.irnSignedQrCode = result.signedQrCode;
  invoice.irnProvider = providerName;
  invoice.irnError = null;
  invoice.irnGeneratedAt = new Date();
  await invoice.save();

  return { invoice, success: true, message: result.message };
}

async function cancelIrnForInvoice(invoiceId, reason) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.irnStatus !== 'GENERATED') throw ApiError.badRequest('No active IRN to cancel on this invoice');

  const { provider } = getIrnProvider();
  const result = await provider.cancelIrn(invoice.irn, reason);

  if (result.success) {
    invoice.irnStatus = 'CANCELLED';
    invoice.irnError = null;
  } else {
    invoice.irnError = result.message;
  }
  await invoice.save();

  return { invoice, success: result.success, message: result.message };
}

module.exports = { generateIrnForInvoice, cancelIrnForInvoice };
