const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    clientCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address1: { type: String, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true },
    gstin: { type: String, trim: true },
    pan: { type: String, trim: true },
    creditLimit: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', clientCode: 'text', email: 'text' });

module.exports = mongoose.model('Client', clientSchema);
