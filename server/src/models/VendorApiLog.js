const mongoose = require('mongoose');

// Structured log of every outbound vendor/courier API call — written from
// shipmentForwarding.service.js. Deliberately does NOT store API keys, secrets or auth
// headers (see the "DO NOT log" list this was scoped against); only request/response
// metadata useful for support/audit.
const vendorApiLogSchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', index: true },
    awbNo: { type: String, trim: true },
    vendorCode: { type: String, trim: true },
    vendorName: { type: String, trim: true },
    action: { type: String, trim: true, required: true },
    requestAt: { type: Date, required: true },
    responseAt: { type: Date },
    durationMs: { type: Number },
    success: { type: Boolean, required: true },
    httpStatus: { type: Number },
    errorCode: { type: String, trim: true },
    errorMessage: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

vendorApiLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VendorApiLog', vendorApiLogSchema);
