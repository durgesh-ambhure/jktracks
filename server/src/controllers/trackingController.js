const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/v1/tracking/:awb -> shipment + full event history sorted by
// date/time. Powers the in-app Tracking feature (PAGES.md /tracking/:awb).
// Accepts either the AWB number or either forwarding number, so the dashboard's
// "Track Your Shipment" widget (AWB / Forwarding toggle) resolves both.
const trackByAwb = asyncHandler(async (req, res) => {
  const query = req.params.awb;
  const shipment = await Shipment.findOne({
    $or: [
      { awbNo: query },
      { 'forwarding.forwardingNo1': query },
      { 'forwarding.forwardingNo2': query }
    ]
  })
    .populate('clientId', 'name clientCode')
    .populate('forwarding.vendorId', 'name vendorCode');

  if (!shipment) throw ApiError.notFound('No shipment found for this AWB / forwarding number');

  const events = await ShipmentEvent.find({ shipmentId: shipment._id }).sort({ date: 1, createdAt: 1 });

  sendSuccess(res, { data: { shipment, events } });
});

module.exports = { trackByAwb };
