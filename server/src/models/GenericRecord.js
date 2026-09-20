const mongoose = require('mongoose');

// SHORTCUT (Tier 2): rather than hand-modeling ~25 bespoke schemas for
// Masters / Invoices / Payments / Imports / KYC / Accounting / Settings,
// we use one flexible collection keyed by `type` (e.g. "masters:zones",
// "invoices", "payments", "imports:client-rate", "kyc",
// "accounting:journal", "settings:company-profile") holding a free-form
// `data` blob. This satisfies the Tier-2 requirement (routes exist,
// persist to MongoDB, return the standard envelope) without modeling
// every field precisely. Full field-level schemas per module are a
// documented TODO for a future pass.
const genericRecordSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    label: { type: String, trim: true }, // convenience display field, optional
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

genericRecordSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('GenericRecord', genericRecordSchema);
