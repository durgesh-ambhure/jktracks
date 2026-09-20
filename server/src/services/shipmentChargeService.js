/**
 * PLACEHOLDER BUSINESS RULE (documented per prompt instructions):
 * Real rate-card logic (per-zone / per-vendor / per-weight-break rate
 * cards, fuel surcharge tables, GST slabs, etc. — see FEATURES.md
 * "Invoicing" section) is out of scope for this pass. Until Invoices /
 * rate-card masters (Tier 2) are fully modeled, we compute a simple
 * illustrative charge breakdown so Shipments have non-zero, internally
 * consistent clientCharges/vendorCharges to power the Dashboard and
 * Reports aggregations:
 *
 *   chargedWeight = max(actualWeight, volumetricWeight)
 *   volumetricWeight (per box) = (L * W * H) / divisor
 *   freight = ratePerKg * chargedWeight
 *   fuel = freight * 0.15
 *   gst = (freight + fuel + otherCharges) * 0.18
 *   total = freight + fuel + otherCharges + gst
 *
 * ratePerKg defaults to 100 for client charges and 80 for vendor charges
 * (illustrative margin) unless overridden by caller.
 */

const DEFAULT_CLIENT_RATE_PER_KG = 100;
const DEFAULT_VENDOR_RATE_PER_KG = 80;
const FUEL_PCT = 0.15;
const GST_PCT = 0.18;

function computeVolumetricWeight(box, divisor = 5000) {
  const { length = 0, width = 0, height = 0, pcs = 1 } = box || {};
  if (!length || !width || !height) return 0;
  return (length * width * height * pcs) / (divisor || 5000);
}

function computeChargedWeight(weightDetails = {}) {
  const divisor = weightDetails.divisor || 5000;
  const boxes = weightDetails.boxes || [];
  const boxVolumetric = boxes.reduce((sum, b) => sum + computeVolumetricWeight(b, divisor), 0);
  const volumetricWeight = boxVolumetric || 0;
  const actualWeight = weightDetails.actualWeight || 0;
  return Math.max(actualWeight, volumetricWeight);
}

function computeCharges(chargedWeight, ratePerKg, otherCharges = 0) {
  const freight = round2(ratePerKg * chargedWeight);
  const fuel = round2(freight * FUEL_PCT);
  const gst = round2((freight + fuel + otherCharges) * GST_PCT);
  const total = round2(freight + fuel + otherCharges + gst);
  return { freight, otherCharges: round2(otherCharges), fuel, gst, total };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Computes both clientCharges and vendorCharges for a shipment payload.
// existingCharges (optional) lets callers preserve manually-overridden
// otherCharges when recalculating on update.
function computeShipmentCharges(shipment) {
  const chargedWeight = computeChargedWeight(shipment.weightDetails || {});

  const clientOther = shipment.clientCharges?.otherCharges || 0;
  const vendorOther = shipment.vendorCharges?.otherCharges || 0;

  const clientCharges = computeCharges(chargedWeight, DEFAULT_CLIENT_RATE_PER_KG, clientOther);
  const vendorCharges = computeCharges(chargedWeight, DEFAULT_VENDOR_RATE_PER_KG, vendorOther);

  return { clientCharges, vendorCharges, chargedWeight };
}

module.exports = {
  computeShipmentCharges,
  computeChargedWeight,
  computeVolumetricWeight
};
