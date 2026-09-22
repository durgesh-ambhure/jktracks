const mongoose = require('mongoose');

const vendorFuelSurchargeSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorFuelSurcharge', vendorFuelSurchargeSchema);
