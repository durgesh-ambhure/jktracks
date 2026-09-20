const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    code: { type: String, trim: true }
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    apiUrl: { type: String, trim: true },
    // Never returned to the client: select:false + explicit .select('-apiKey')
    // exclusion is also applied everywhere this model is queried.
    apiKey: { type: String, select: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    serviceTypes: { type: [serviceTypeSchema], default: [] },
    trackingEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
