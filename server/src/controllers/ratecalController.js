const RateCard = require('../models/RateCard');
const VendorFuelSurcharge = require('../models/VendorFuelSurcharge');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

// POST /api/v1/ratecal/compare — real comparison over RateCard + VendorFuelSurcharge records
// (see RateCard.js / VendorFuelSurcharge.js). For a given zone + weight, finds every active
// VENDOR rate card whose weight bracket covers the shipment (or whose top bracket can be
// extrapolated via additionalRatePerKg), applies that vendor's current fuel surcharge %, and
// returns vendors sorted cheapest-first. Powers RateCalculatorPage.jsx.
const compareRates = asyncHandler(async (req, res) => {
  const { zone, weight } = req.body;
  if (!zone || weight === undefined || weight === null) {
    throw ApiError.badRequest('zone and weight are required');
  }
  const w = Number(weight);
  if (!(w > 0)) throw ApiError.badRequest('weight must be a positive number');

  const cards = await RateCard.find({
    partyType: 'VENDOR',
    zone: String(zone).trim().toUpperCase(),
    status: 'ACTIVE'
  }).populate('vendorId', 'name vendorCode status');

  // Pick the best-matching bracket per vendor: an exact [weightFrom, weightTo] match wins;
  // otherwise the highest bracket below the shipment weight is extrapolated via
  // additionalRatePerKg (a rate card with no card at all for that vendor/zone is skipped).
  const byVendor = new Map();
  for (const card of cards) {
    if (!card.vendorId || card.vendorId.status !== 'ACTIVE') continue;
    const vendorKey = String(card.vendorId._id);

    let rate = null;
    if (w >= card.weightFrom && w <= card.weightTo) {
      rate = card.baseRate;
    } else if (w > card.weightTo) {
      rate = card.baseRate + (w - card.weightTo) * (card.additionalRatePerKg || 0);
    }
    if (rate === null) continue;

    const existing = byVendor.get(vendorKey);
    if (!existing || rate < existing.rate) {
      byVendor.set(vendorKey, { vendor: card.vendorId, rate, currency: card.currency, serviceType: card.serviceType });
    }
  }

  const vendorIds = [...byVendor.keys()];
  const surcharges = await VendorFuelSurcharge.find({ vendorId: { $in: vendorIds }, status: 'ACTIVE' }).sort({ effectiveFrom: -1 });
  const surchargeByVendor = new Map();
  for (const s of surcharges) {
    const key = String(s.vendorId);
    if (!surchargeByVendor.has(key)) surchargeByVendor.set(key, s.percentage);
  }

  const results = [...byVendor.entries()].map(([vendorId, entry]) => {
    const fuelPercent = surchargeByVendor.get(vendorId) || 0;
    const fuelAmount = Number(((entry.rate * fuelPercent) / 100).toFixed(2));
    const total = Number((entry.rate + fuelAmount).toFixed(2));
    return {
      vendorId,
      vendorName: entry.vendor.name,
      vendorCode: entry.vendor.vendorCode,
      serviceType: entry.serviceType || null,
      currency: entry.currency || 'INR',
      baseRate: Number(entry.rate.toFixed(2)),
      fuelSurchargePercent: fuelPercent,
      fuelAmount,
      total
    };
  }).sort((a, b) => a.total - b.total);

  sendSuccess(res, {
    message: results.length ? `${results.length} vendor rate(s) found` : 'No vendor rate card covers this zone/weight',
    data: { zone: String(zone).trim().toUpperCase(), weight: w, results }
  });
});

module.exports = { compareRates };
