const mongoose = require('mongoose');

const PARTY_FIELDS_BASE = {
  name: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  address1: { type: String, trim: true },
  address2: { type: String, trim: true },
  address3: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  phone: { type: String, trim: true },
  phone2: { type: String, trim: true },
  email: { type: String, trim: true },
  pan: { type: String, trim: true },
  gstin: { type: String, trim: true },
  iec: { type: String, trim: true },
  aadhaarNo: { type: String, trim: true }
};

const consignorSchema = new mongoose.Schema(
  {
    ...PARTY_FIELDS_BASE,
    bankADCode: { type: String, trim: true },
    bankAC: { type: String, trim: true },
    bankIFSC: { type: String, trim: true }
  },
  { _id: false }
);

const consigneeSchema = new mongoose.Schema(
  {
    ...PARTY_FIELDS_BASE,
    iossNo: { type: String, trim: true },
    iossAmount: { type: Number, default: 0 }
  },
  { _id: false }
);

const boxSchema = new mongoose.Schema(
  {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    pcs: { type: Number, default: 1 },
    actualWeight: { type: Number, default: 0 },
    volumetricWeight: { type: Number, default: 0 }
  },
  { _id: false }
);

const weightDetailsSchema = new mongoose.Schema(
  {
    pieces: { type: Number, default: 1 },
    actualWeight: { type: Number, default: 0 },
    vendorWeight: { type: Number, default: 0 },
    weightUnit: { type: String, enum: ['KGS', 'LBS'], default: 'KGS' },
    totalValue: { type: Number, default: 0 },
    valueCurrency: { type: String, default: 'INR' },
    divisor: { type: Number, default: 5000 },
    isVolumetric: { type: Boolean, default: false },
    boxes: { type: [boxSchema], default: [] }
  },
  { _id: false }
);

const forwardingSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    serviceType: { type: String, trim: true },
    packaging: { type: String, trim: true },
    forwardingNo1: { type: String, trim: true },
    forwardingNo2: { type: String, trim: true },
    vendorAccountNo: { type: String, trim: true },
    dutiesAccountNo: { type: String, trim: true },
    billDutiesTo: { type: String, enum: ['SENDER', 'RECIPIENT'], default: 'SENDER' },
    billShipmentTo: { type: String, enum: ['SENDER', 'RECIPIENT'], default: 'SENDER' },
    pickupPoint: { type: String, trim: true },
    incoterms: { type: String, enum: ['DDP', 'DDU'], default: 'DDU' },
    shipmentPurpose: { type: String, trim: true }
  },
  { _id: false }
);

const chargesSchema = new mongoose.Schema(
  {
    freight: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    fuel: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

const SHIPMENT_STATUSES = [
  'BOOKED',
  'PICKED UP',
  'INTRANSIT',
  'ARRIVED',
  'PACKET AT HUB',
  'HANDOVER TO CARRIER',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'UN-DELIVERED',
  'RTO',
  'HOLD AT CUSTOM',
  'CANCELLED'
];

const shipmentSchema = new mongoose.Schema(
  {
    awbNo: { type: String, unique: true, index: true, trim: true },
    refNo: { type: String, trim: true },
    bookingDate: { type: Date, default: Date.now },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    businessType: { type: String, enum: ['B2B', 'B2C', 'C2C'], default: 'B2C' },
    consignor: { type: consignorSchema, default: () => ({}) },
    consignee: { type: consigneeSchema, default: () => ({}) },
    packetType: { type: String, enum: ['DOX', 'SPX'], default: 'DOX' },
    paymentType: { type: String, enum: ['CASH', 'COD', 'CREDIT', 'WALLET'], default: 'CASH' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    invoiceNo: { type: String, trim: true },
    packetDescription: { type: String, trim: true },
    invoiceDescription: { type: String, trim: true },
    weightDetails: { type: weightDetailsSchema, default: () => ({}) },
    forwarding: { type: forwardingSchema, default: () => ({}) },
    clientCharges: { type: chargesSchema, default: () => ({}) },
    vendorCharges: { type: chargesSchema, default: () => ({}) },
    status: { type: String, enum: SHIPMENT_STATUSES, default: 'BOOKED', index: true },
    isCancelled: { type: Boolean, default: false },
    cancellationReason: { type: String, trim: true },
    operationRemarks: { type: String, trim: true },
    accountingRemarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

shipmentSchema.index({ refNo: 1 });
shipmentSchema.index({ bookingDate: -1 });
shipmentSchema.index({ 'consignee.name': 'text', 'consignor.name': 'text' });

shipmentSchema.statics.STATUSES = SHIPMENT_STATUSES;

module.exports = mongoose.model('Shipment', shipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
