const mongoose = require('mongoose');

const clientTaxRateSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'GST'], required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientTaxRate', clientTaxRateSchema);
