const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');

const listEvents = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  const events = await ShipmentEvent.find({ shipmentId: shipment._id }).sort({ date: 1, createdAt: 1 });
  sendSuccess(res, { data: events });
});

const createEvent = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  const event = await ShipmentEvent.create({
    ...req.body,
    shipmentId: shipment._id,
    awbNo: shipment.awbNo,
    createdBy: req.user.id
  });

  // Auto-update the parent Shipment.status whenever a new event is posted.
  shipment.status = event.status;
  if (event.status === 'CANCELLED') {
    shipment.isCancelled = true;
  }
  await shipment.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'ShipmentEvent',
    entityId: event._id,
    formName: 'ShipmentMovement',
    actionDescription: `Added event '${event.status}' for shipment ${shipment.awbNo}`,
    refNo: shipment.awbNo,
    newValue: req.body
  });

  sendSuccess(res, { message: 'Event added', data: event, statusCode: 201 });
});

module.exports = { listEvents, createEvent };
