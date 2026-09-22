const Shipment = require('../models/Shipment');
const Vendor = require('../models/Vendor');
const VendorApiLog = require('../models/VendorApiLog');
const ApiError = require('../utils/ApiError');
const { getCourierProvider } = require('../integrations/courier/courier.factory');

// Never throws — a failed log write should not fail the parent forwarding request (same
// convention as auditService.logAction).
async function logVendorApiCall(entry) {
  try {
    await VendorApiLog.create(entry);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[shipmentForwarding] failed to write VendorApiLog:', err.message);
  }
}

const MAX_RAW_RESPONSE_CHARS = 4000;

// Keeps a bounded, JSON-serializable snapshot of the vendor's raw response instead of storing
// an unbounded blob in MongoDB.
function sanitizeRawResponse(raw) {
  if (!raw) return null;
  try {
    const json = JSON.stringify(raw);
    if (json.length <= MAX_RAW_RESPONSE_CHARS) return raw;
    return { truncated: true, preview: json.slice(0, MAX_RAW_RESPONSE_CHARS) };
  } catch {
    return { unserializable: true };
  }
}

// Friendly, non-technical messages surfaced to the user; full detail goes to lastError/logs.
function toUserMessage(err) {
  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
    return 'Unable to forward shipment — courier API did not respond in time. The vendor may have already received this request; please verify before retrying.';
  }
  if (err?.response?.status >= 500) {
    return 'Unable to forward shipment — courier API is temporarily unavailable.';
  }
  if (err?.response?.status === 401 || err?.response?.status === 403) {
    return 'Unable to forward shipment — courier API authentication failed.';
  }
  return err?.message || 'Unable to forward shipment.';
}

/**
 * Forwards a shipment to its assigned vendor's courier API and persists the outcome onto
 * Shipment.courierForwarding. Called from shipmentController.forwardShipment — all vendor
 * request/response handling lives behind courier.factory.js's provider abstraction, so this
 * function (and the controller) never sees vendor-specific shapes.
 *
 * `courierCode` is an optional override; when omitted, the vendor already attached to the
 * shipment (forwarding.vendorId) is used — the shipment form already captures courier
 * selection, so forwarding doesn't require a second picker.
 */
async function forwardShipmentToVendor(shipmentId, { courierCode, userId } = {}) {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  if (shipment.courierForwarding?.status === 'FORWARDED') {
    throw ApiError.conflict('Shipment has already been forwarded');
  }
  if (shipment.status === 'CANCELLED' || shipment.isCancelled) {
    throw ApiError.badRequest('Cancelled shipments cannot be forwarded');
  }

  let vendor = null;
  if (courierCode) {
    vendor = await Vendor.findOne({ vendorCode: courierCode }).select('+apiKey');
  } else if (shipment.forwarding?.vendorId) {
    vendor = await Vendor.findById(shipment.forwarding.vendorId).select('+apiKey');
  }
  if (!vendor) {
    throw ApiError.badRequest('No courier/vendor is assigned to this shipment. Select a vendor in Forwarding Details, or pass courierCode.');
  }
  if (vendor.status !== 'ACTIVE') {
    throw ApiError.badRequest(`Vendor "${vendor.name}" is inactive and cannot be forwarded to`);
  }

  shipment.courierForwarding = {
    ...shipment.courierForwarding?.toObject?.(),
    status: 'FORWARDING',
    vendorCode: vendor.vendorCode,
    vendorName: vendor.name,
    attempts: (shipment.courierForwarding?.attempts || 0) + 1,
    lastAttemptAt: new Date()
  };
  await shipment.save();

  const provider = getCourierProvider(vendor);
  const requestAt = new Date();

  let result;
  try {
    result = await provider.createShipment(shipment.toObject());
  } catch (err) {
    shipment.courierForwarding.status = 'FORWARDING_FAILED';
    shipment.courierForwarding.lastError = toUserMessage(err);
    await shipment.save();
    // eslint-disable-next-line no-console
    console.error(`[shipmentForwarding] ${vendor.vendorCode} createShipment failed for shipment ${shipment._id}:`, err.message);

    const responseAt = new Date();
    await logVendorApiCall({
      shipmentId: shipment._id,
      awbNo: shipment.awbNo,
      vendorCode: vendor.vendorCode,
      vendorName: vendor.name,
      action: 'createShipment',
      requestAt,
      responseAt,
      durationMs: responseAt - requestAt,
      success: false,
      httpStatus: err?.response?.status || null,
      errorCode: err?.code || null,
      errorMessage: err?.message || shipment.courierForwarding.lastError,
      userId
    });

    return { shipment, success: false, message: shipment.courierForwarding.lastError };
  }

  const responseAt = new Date();
  const logBase = {
    shipmentId: shipment._id,
    awbNo: shipment.awbNo,
    vendorCode: vendor.vendorCode,
    vendorName: vendor.name,
    action: 'createShipment',
    requestAt,
    responseAt,
    durationMs: responseAt - requestAt,
    userId
  };

  if (!result?.success) {
    shipment.courierForwarding.status = 'FORWARDING_FAILED';
    shipment.courierForwarding.lastError = result?.message || 'Vendor rejected the shipment';
    shipment.courierForwarding.vendorStatus = result?.status || null;
    shipment.courierForwarding.vendorResponse = sanitizeRawResponse(result?.rawResponse);
    await shipment.save();

    await logVendorApiCall({ ...logBase, success: false, errorMessage: shipment.courierForwarding.lastError });

    return { shipment, success: false, message: shipment.courierForwarding.lastError };
  }

  shipment.courierForwarding.status = 'FORWARDED';
  shipment.courierForwarding.vendorShipmentId = result.vendorShipmentId || null;
  shipment.courierForwarding.vendorAwbNumber = result.awbNumber || null;
  shipment.courierForwarding.trackingNumber = result.trackingNumber || null;
  shipment.courierForwarding.labelUrl = result.labelUrl || null;
  shipment.courierForwarding.vendorStatus = result.status || null;
  shipment.courierForwarding.forwardedAt = new Date();
  shipment.courierForwarding.lastError = null;
  shipment.courierForwarding.vendorResponse = sanitizeRawResponse(result.rawResponse);
  await shipment.save();

  await logVendorApiCall({ ...logBase, success: true });

  return { shipment, success: true, message: result.message || 'Shipment forwarded successfully' };
}

module.exports = { forwardShipmentToVendor };
