const Shipment = require('../models/Shipment');
const ClientTaxRate = require('../models/ClientTaxRate');
const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');
const { generateInvoiceNo } = require('./invoiceNumberService');

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Shared by "Generate Client Bill" (STANDARD), "Cash/ToPay Invoice" (TOPAY) and "Cargo Tax
// Invoice" (CARGO_TAX) — the difference between the three is entirely in which shipments are
// matched and whether a tax breakup is computed, not in a separate generation mechanism per
// page (mirrors how the client's InvoiceCreatePage always posted to the same /invoices
// endpoint — this keeps that single-endpoint shape, now backed by real Shipment data).
async function generateInvoice({ clientId, fromDate, toDate, invoiceType = 'STANDARD', userId }) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw ApiError.badRequest('Invalid date range');
  }

  const filter = {
    clientId,
    bookingDate: { $gte: from, $lte: to },
    isCancelled: { $ne: true }
  };
  // ToPay invoices only cover shipments actually billed cash/COD at the point of
  // delivery/booking, not ones already settled on credit or wallet.
  if (invoiceType === 'TOPAY') {
    filter.paymentType = { $in: ['CASH', 'COD'] };
  }
  // Cargo (non-document) shipments only — SPX packetType, per PACKET_TYPE_OPTIONS.
  if (invoiceType === 'CARGO_TAX') {
    filter.packetType = 'SPX';
  }

  const shipments = await Shipment.find(filter).select('awbNo clientCharges').lean();
  if (shipments.length === 0) {
    throw ApiError.badRequest('No matching shipments found for this client and date range');
  }

  const lineItems = shipments.map((s) => ({
    shipmentId: s._id,
    awbNo: s.awbNo,
    amount: round2(s.clientCharges?.total || 0)
  }));
  const subTotal = round2(lineItems.reduce((sum, li) => sum + li.amount, 0));

  let taxBreakup = [];
  let taxAmount = 0;
  if (invoiceType === 'CARGO_TAX') {
    const taxRates = await ClientTaxRate.find({ clientId, status: 'ACTIVE' });
    taxBreakup = taxRates.map((t) => ({
      taxType: t.taxType,
      percentage: t.percentage,
      amount: round2((subTotal * t.percentage) / 100)
    }));
    taxAmount = round2(taxBreakup.reduce((sum, t) => sum + t.amount, 0));
  }

  const invoiceNo = await generateInvoiceNo();

  const invoice = await Invoice.create({
    invoiceNo,
    invoiceType,
    clientId,
    fromDate: from,
    toDate: to,
    lineItems,
    subTotal,
    taxBreakup,
    taxAmount,
    amount: round2(subTotal + taxAmount),
    status: 'GENERATED',
    createdBy: userId
  });

  return invoice;
}

// Void + reissue: marks the existing invoice VOIDED (audit trail preserved, never deleted) and
// generates a brand-new invoice over the same client/date-range/type, linked both ways.
async function voidAndRegenerateInvoice(invoiceId, { reason, userId }) {
  const original = await Invoice.findById(invoiceId);
  if (!original) throw ApiError.notFound('Invoice not found');
  if (original.status === 'VOIDED') throw ApiError.conflict('Invoice is already voided');

  const reissued = await generateInvoice({
    clientId: original.clientId,
    fromDate: original.fromDate,
    toDate: original.toDate,
    invoiceType: original.invoiceType,
    userId
  });
  reissued.regeneratedFromId = original._id;
  await reissued.save();

  original.status = 'VOIDED';
  original.voidReason = reason;
  original.voidedInvoiceId = reissued._id;
  await original.save();

  return { original, reissued };
}

module.exports = { generateInvoice, voidAndRegenerateInvoice };
