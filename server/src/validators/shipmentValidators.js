const Joi = require('joi');

const partyBase = {
  name: Joi.string().trim().allow('', null),
  contactPerson: Joi.string().trim().allow('', null),
  address1: Joi.string().trim().allow('', null),
  address2: Joi.string().trim().allow('', null),
  address3: Joi.string().trim().allow('', null),
  pincode: Joi.string().trim().allow('', null),
  country: Joi.string().trim().allow('', null),
  state: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().allow('', null),
  phone2: Joi.string().trim().allow('', null),
  email: Joi.string().allow('', null),
  pan: Joi.string().trim().allow('', null),
  gstin: Joi.string().trim().allow('', null),
  iec: Joi.string().trim().allow('', null),
  aadhaarNo: Joi.string().trim().allow('', null),
  kycType: Joi.string().trim().allow('', null),
  kycNumber: Joi.string().trim().allow('', null),
  kycDocument1: Joi.string().trim().allow('', null),
  kycDocument2: Joi.string().trim().allow('', null)
};

const consignor = Joi.object({
  ...partyBase,
  bankADCode: Joi.string().trim().allow('', null),
  bankAC: Joi.string().trim().allow('', null),
  bankIFSC: Joi.string().trim().allow('', null)
});

const consignee = Joi.object({
  ...partyBase,
  iossNo: Joi.string().trim().allow('', null),
  iossAmount: Joi.number().allow(null)
});

const box = Joi.object({
  parcelNo: Joi.string().trim().allow('', null),
  boxNo: Joi.string().trim().allow('', null),
  length: Joi.number().min(0),
  width: Joi.number().min(0),
  height: Joi.number().min(0),
  pcs: Joi.number().min(1),
  actualWeight: Joi.number().min(0),
  volumetricWeight: Joi.number().min(0),
  chargeableWeight: Joi.number().min(0)
});

const weightDetails = Joi.object({
  pieces: Joi.number().min(1),
  actualWeight: Joi.number().min(0),
  vendorWeight: Joi.number().min(0),
  weightUnit: Joi.string().valid('KGS', 'LBS'),
  totalValue: Joi.number().min(0),
  valueCurrency: Joi.string(),
  divisor: Joi.number().min(1),
  isVolumetric: Joi.boolean(),
  chargeableWeight: Joi.number().min(0),
  boxes: Joi.array().items(box)
});

const forwarding = Joi.object({
  vendorId: Joi.string().hex().length(24).allow('', null),
  serviceType: Joi.string().trim().allow('', null),
  packaging: Joi.string().trim().allow('', null),
  forwardingNo1: Joi.string().trim().allow('', null),
  forwardingNo2: Joi.string().trim().allow('', null),
  vendorAccountNo: Joi.string().trim().allow('', null),
  dutiesAccountNo: Joi.string().trim().allow('', null),
  billDutiesTo: Joi.string().valid('SENDER', 'RECIPIENT'),
  billShipmentTo: Joi.string().valid('SENDER', 'RECIPIENT'),
  pickupPoint: Joi.string().trim().allow('', null),
  incoterms: Joi.string().valid('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'DDU'),
  shipmentPurpose: Joi.string().trim().allow('', null)
});

const charges = Joi.object({
  freight: Joi.number(),
  otherCharges: Joi.number(),
  fuel: Joi.number(),
  gst: Joi.number(),
  total: Joi.number()
});

const invoiceItem = Joi.object({
  boxNo: Joi.string().trim().allow('', null),
  srNo: Joi.number().allow(null),
  description: Joi.string().trim().allow('', null),
  hsCode: Joi.string().trim().allow('', null),
  unitType: Joi.string().trim().allow('', null),
  quantity: Joi.number().allow(null),
  unitWeight: Joi.number().allow(null),
  igst: Joi.number().allow(null),
  unitRate: Joi.number().allow(null),
  amount: Joi.number().allow(null)
});

const invoice = Joi.object({
  createInvoice: Joi.boolean(),
  invoiceType: Joi.string().trim().allow('', null),
  noteType: Joi.string().trim().allow('', null),
  items: Joi.array().items(invoiceItem)
});

const STATUSES = [
  'BOOKED', 'PICKED UP', 'INTRANSIT', 'ARRIVED', 'PACKET AT HUB', 'HANDOVER TO CARRIER',
  'OUT FOR DELIVERY', 'DELIVERED', 'UN-DELIVERED', 'RTO', 'HOLD AT CUSTOM', 'CANCELLED'
];

const createShipment = Joi.object({
  awbNo: Joi.string().trim().allow('', null),
  refNo: Joi.string().trim().allow('', null),
  bookingDate: Joi.date().optional(),
  clientId: Joi.string().hex().length(24).required(),
  businessType: Joi.string().valid('B2B', 'B2C', 'C2C'),
  originCode: Joi.string().trim().allow('', null),
  originName: Joi.string().trim().allow('', null),
  originZone: Joi.string().trim().allow('', null),
  destCode: Joi.string().trim().allow('', null),
  destName: Joi.string().trim().allow('', null),
  destZone: Joi.string().trim().allow('', null),
  product: Joi.string().trim().allow('', null),
  consignor,
  consignee,
  packetType: Joi.string().valid('DOX', 'SPX'),
  paymentType: Joi.string().valid('CASH', 'COD', 'CREDIT', 'WALLET'),
  amount: Joi.number().min(0),
  currency: Joi.string(),
  invoiceDate: Joi.date().allow(null),
  invoiceNo: Joi.string().trim().allow('', null),
  eWayBill: Joi.string().trim().allow('', null),
  codAmount: Joi.number().min(0).allow(null),
  insAmount: Joi.number().min(0).allow(null),
  packetDescription: Joi.string().trim().allow('', null),
  invoiceDescription: Joi.string().trim().allow('', null),
  weightDetails,
  forwarding,
  invoice,
  clientCharges: charges,
  vendorCharges: charges,
  status: Joi.string().valid(...STATUSES),
  operationRemarks: Joi.string().trim().allow('', null),
  accountingRemarks: Joi.string().trim().allow('', null)
});

const updateShipment = createShipment.fork(['clientId'], (s) => s.optional()).min(1);

const cancelShipment = Joi.object({
  reason: Joi.string().trim().required()
});

module.exports = { createShipment, updateShipment, cancelShipment };
