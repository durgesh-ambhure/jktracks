const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    awbNo: { type: String, trim: true },
    amount: { type: Number, default: 0 }
  },
  { _id: false }
);

const taxBreakupSchema = new mongoose.Schema(
  {
    taxType: { type: String, trim: true },
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  { _id: false }
);

const INVOICE_TYPES = ['STANDARD', 'TOPAY', 'CARGO_TAX'];
const INVOICE_STATUSES = ['GENERATED', 'VOIDED', 'REISSUED'];
const IRN_STATUSES = ['NOT_GENERATED', 'GENERATED', 'FAILED', 'CANCELLED'];

// Real, bespoke model — replaces the earlier GenericRecord{type:'invoices'} placeholder.
// Generated from actual Shipment records (invoiceController.js), not free-form client input.
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, index: true, trim: true },
    invoiceType: { type: String, enum: INVOICE_TYPES, default: 'STANDARD' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceDate: { type: Date, default: Date.now },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    lineItems: { type: [lineItemSchema], default: [] },
    subTotal: { type: Number, default: 0 },
    taxBreakup: { type: [taxBreakupSchema], default: [] },
    taxAmount: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: INVOICE_STATUSES, default: 'GENERATED' },
    voidReason: { type: String, trim: true },
    voidedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    regeneratedFromId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    // GST e-Invoice IRN — see server/src/integrations/irn/. irnProvider records which provider
    // actually generated it (e.g. "MOCK" until real NIC/GSP credentials are configured).
    irnStatus: { type: String, enum: IRN_STATUSES, default: 'NOT_GENERATED' },
    irn: { type: String, trim: true },
    irnAckNo: { type: String, trim: true },
    irnAckDate: { type: Date },
    irnSignedQrCode: { type: String },
    irnProvider: { type: String, trim: true },
    irnError: { type: String, trim: true },
    irnGeneratedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

invoiceSchema.index({ clientId: 1, fromDate: 1, toDate: 1 });

invoiceSchema.statics.INVOICE_TYPES = INVOICE_TYPES;
invoiceSchema.statics.INVOICE_STATUSES = INVOICE_STATUSES;
invoiceSchema.statics.IRN_STATUSES = IRN_STATUSES;

module.exports = mongoose.model('Invoice', invoiceSchema);
module.exports.INVOICE_TYPES = INVOICE_TYPES;
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
module.exports.IRN_STATUSES = IRN_STATUSES;
