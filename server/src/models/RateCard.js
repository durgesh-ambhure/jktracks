const mongoose = require('mongoose');

// Backs both "Vendor Rate Entry" (partyType VENDOR — what we pay the vendor) and
// "Client Rate Entry" (partyType CLIENT — what we charge the client), and is queried by
// the Rate Calculator (ratecalController.js) to compare vendors for a given zone/weight.
const rateCardSchema = new mongoose.Schema(
  {
    partyType: { type: String, enum: ['VENDOR', 'CLIENT'], required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    zone: { type: String, required: true, trim: true, uppercase: true },
    serviceType: { type: String, trim: true },
    weightFrom: { type: Number, required: true, min: 0 },
    weightTo: { type: Number, required: true, min: 0 },
    baseRate: { type: Number, required: true, min: 0 },
    additionalRatePerKg: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    effectiveFrom: { type: Date, default: Date.now },
    effectiveTo: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

rateCardSchema.pre('validate', function preValidate(next) {
  if (this.partyType === 'VENDOR' && !this.vendorId) {
    return next(new Error('vendorId is required for a VENDOR rate card'));
  }
  if (this.partyType === 'CLIENT' && !this.clientId) {
    return next(new Error('clientId is required for a CLIENT rate card'));
  }
  if (this.weightTo < this.weightFrom) {
    return next(new Error('weightTo must be greater than or equal to weightFrom'));
  }
  return next();
});

rateCardSchema.index({ partyType: 1, vendorId: 1, zone: 1 });
rateCardSchema.index({ partyType: 1, clientId: 1, zone: 1 });

module.exports = mongoose.model('RateCard', rateCardSchema);
