const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');
const { computeShipmentCharges } = require('../services/shipmentChargeService');
const { generateAwbNo } = require('../services/awbService');
const { toCsv } = require('../utils/csv');

const listShipments = asyncHandler(async (req, res) => {
  const { page, limit, skip, filter, sort } = buildListQuery(req.query, ['awbNo', 'refNo', 'invoiceNo']);

  if (req.query.status) filter.status = req.query.status;
  if (req.query.clientId) filter.clientId = req.query.clientId;
  if (req.query.paymentType) filter.paymentType = req.query.paymentType;
  if (req.query.fromDate || req.query.toDate) {
    filter.bookingDate = {};
    if (req.query.fromDate) filter.bookingDate.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) filter.bookingDate.$lte = new Date(req.query.toDate);
  }

  const [items, total] = await Promise.all([
    Shipment.find(filter).sort(sort).skip(skip).limit(limit).populate('clientId', 'name clientCode'),
    Shipment.countDocuments(filter)
  ]);

  sendList(res, { data: items, pagination: buildPagination({ page, limit, total }) });
});

const getShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('clientId', 'name clientCode')
    .populate('forwarding.vendorId', 'name vendorCode');
  if (!shipment) throw ApiError.notFound('Shipment not found');
  sendSuccess(res, { data: shipment });
});

const createShipment = asyncHandler(async (req, res) => {
  const awbNo = req.body.awbNo || (await generateAwbNo());

  // Server-side computed clientCharges/vendorCharges (placeholder rule —
  // see shipmentChargeService.js). Any client-supplied otherCharges is
  // respected as an input to the calc.
  const { clientCharges, vendorCharges } = computeShipmentCharges(req.body);

  const shipment = await Shipment.create({
    ...req.body,
    awbNo,
    clientCharges,
    vendorCharges,
    createdBy: req.user.id
  });

  await ShipmentEvent.create({
    shipmentId: shipment._id,
    awbNo: shipment.awbNo,
    date: new Date(),
    status: shipment.status,
    statusDetails: 'Shipment booked',
    createdBy: req.user.id
  });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Shipment',
    entityId: shipment._id,
    formName: 'Shipments',
    actionDescription: `Created shipment ${shipment.awbNo}`,
    refNo: shipment.awbNo
  });

  sendSuccess(res, { message: 'Shipment created', data: shipment, statusCode: 201 });
});

const updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  const previousValue = shipment.toObject();

  Object.assign(shipment, req.body);

  // Recompute charges if weight-affecting fields changed.
  if (req.body.weightDetails) {
    const { clientCharges, vendorCharges } = computeShipmentCharges(shipment.toObject());
    shipment.clientCharges = clientCharges;
    shipment.vendorCharges = vendorCharges;
  }

  await shipment.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'Shipment',
    entityId: shipment._id,
    formName: 'Shipments',
    actionDescription: `Updated shipment ${shipment.awbNo}`,
    refNo: shipment.awbNo,
    previousValue,
    newValue: req.body
  });

  sendSuccess(res, { message: 'Shipment updated', data: shipment });
});

const deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  await shipment.deleteOne();
  await ShipmentEvent.deleteMany({ shipmentId: shipment._id });

  await logAction(req, {
    action: 'DELETE',
    entity: 'Shipment',
    entityId: shipment._id,
    formName: 'Shipments',
    actionDescription: `Deleted shipment ${shipment.awbNo}`,
    refNo: shipment.awbNo
  });

  sendSuccess(res, { message: 'Shipment deleted', data: {} });
});

const cancelShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  if (shipment.status === 'CANCELLED') {
    throw ApiError.conflict('Shipment already cancelled');
  }

  shipment.status = 'CANCELLED';
  shipment.isCancelled = true;
  shipment.cancellationReason = req.body.reason;
  await shipment.save();

  await ShipmentEvent.create({
    shipmentId: shipment._id,
    awbNo: shipment.awbNo,
    date: new Date(),
    status: 'CANCELLED',
    statusDetails: req.body.reason,
    createdBy: req.user.id
  });

  await logAction(req, {
    action: 'CANCEL',
    entity: 'Shipment',
    entityId: shipment._id,
    formName: 'Shipments',
    actionDescription: `Cancelled shipment ${shipment.awbNo}: ${req.body.reason}`,
    refNo: shipment.awbNo
  });

  sendSuccess(res, { message: 'Shipment cancelled', data: shipment });
});

const EXPORT_COLUMNS = [
  { label: 'AWB No', value: 'awbNo' },
  { label: 'Ref No', value: 'refNo' },
  { label: 'Booking Date', value: (r) => (r.bookingDate ? new Date(r.bookingDate).toISOString().slice(0, 10) : '') },
  { label: 'Client', value: (r) => r.clientId?.name || '' },
  { label: 'Consignee', value: (r) => r.consignee?.name || '' },
  { label: 'Business Type', value: 'businessType' },
  { label: 'Packet Type', value: 'packetType' },
  { label: 'Payment Type', value: 'paymentType' },
  { label: 'Status', value: 'status' },
  { label: 'Client Total', value: (r) => r.clientCharges?.total ?? 0 },
  { label: 'Vendor Total', value: (r) => r.vendorCharges?.total ?? 0 }
];

const exportShipments = asyncHandler(async (req, res) => {
  const { filter, sort } = buildListQuery(req.query, ['awbNo', 'refNo', 'invoiceNo']);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.clientId) filter.clientId = req.query.clientId;
  if (req.query.paymentType) filter.paymentType = req.query.paymentType;
  if (req.query.fromDate || req.query.toDate) {
    filter.bookingDate = {};
    if (req.query.fromDate) filter.bookingDate.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) filter.bookingDate.$lte = new Date(req.query.toDate);
  }

  // Bounded export (max 5000 rows) to avoid unbounded memory use; still
  // "streams" the response as a single CSV body write.
  const rows = await Shipment.find(filter).sort(sort).limit(5000).populate('clientId', 'name clientCode').lean();

  const csv = toCsv(rows, EXPORT_COLUMNS);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="shipments-export.csv"');
  res.status(200).send(csv);
});

module.exports = {
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
  cancelShipment,
  exportShipments
};
