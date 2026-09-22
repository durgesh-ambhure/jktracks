const Joi = require('joi');

// courierCode is optional — when omitted, the shipment's own forwarding.vendorId is used
// (see shipmentForwarding.service.js). When provided, it must match a Vendor.vendorCode.
const forwardShipment = Joi.object({
  courierCode: Joi.string().trim().uppercase().allow('', null)
});

module.exports = { forwardShipment };
