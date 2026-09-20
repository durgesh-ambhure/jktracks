const mongoose = require('mongoose');

const shipmentEventSchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    awbNo: { type: String, required: true, index: true, trim: true },
    date: { type: Date, default: Date.now },
    time: { type: String, trim: true },
    status: { type: String, required: true, trim: true },
    reasonCode: { type: String, trim: true },
    location: { type: String, trim: true },
    statusDetails: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

shipmentEventSchema.index({ shipmentId: 1, date: 1 });

module.exports = mongoose.model('ShipmentEvent', shipmentEventSchema);
