const mongoose = require('mongoose');

// Value-added-service assignment per client (e.g. Fuel Surcharge Waiver, Insurance,
// Signature POD, ODA Delivery) — rate is optional (some VAS are flat inclusions, not charged).
const clientVasSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    vasName: { type: String, required: true, trim: true },
    rate: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    effectiveFrom: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientVas', clientVasSchema);
