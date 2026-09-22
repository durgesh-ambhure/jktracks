const mongoose = require('mongoose');

// Per-vendor, per-service-type booking configuration — which of a vendor's declared
// serviceTypes (Vendor.serviceTypes) are actually enabled for booking right now, plus a
// priority used to order vendors within the same zone/weight match in the Rate Calculator.
const vendorServiceConfigSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    serviceType: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    cutoffTime: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

vendorServiceConfigSchema.index({ vendorId: 1, serviceType: 1 }, { unique: true });

module.exports = mongoose.model('VendorServiceConfig', vendorServiceConfigSchema);
