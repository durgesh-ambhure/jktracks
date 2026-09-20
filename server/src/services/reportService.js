const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const AuditLog = require('../models/AuditLog');

const GROUP_FORMATS = {
  daily: { year: { $year: '$bookingDate' }, month: { $month: '$bookingDate' }, day: { $dayOfMonth: '$bookingDate' } },
  monthly: { year: { $year: '$bookingDate' }, month: { $month: '$bookingDate' } },
  quarter: { year: { $year: '$bookingDate' }, quarter: { $ceil: { $divide: [{ $month: '$bookingDate' }, 3] } } },
  fy: { fy: { $cond: [{ $gte: [{ $month: '$bookingDate' }, 4] }, { $year: '$bookingDate' }, { $subtract: [{ $year: '$bookingDate' }, 1] }] } }
};

async function getSalesReport({ fromDate, toDate, groupBy = 'monthly', clientId }) {
  const match = {};
  if (fromDate || toDate) {
    match.bookingDate = {};
    if (fromDate) match.bookingDate.$gte = new Date(fromDate);
    if (toDate) match.bookingDate.$lte = new Date(toDate);
  }
  if (clientId) {
    match.clientId = new mongoose.Types.ObjectId(clientId);
  }

  const groupId = GROUP_FORMATS[groupBy] || GROUP_FORMATS.monthly;

  const rows = await Shipment.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        shipmentCount: { $sum: 1 },
        sales: { $sum: '$clientCharges.total' },
        expense: { $sum: '$vendorCharges.total' },
        codAmount: { $sum: { $cond: [{ $eq: ['$paymentType', 'COD'] }, '$amount', 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        group: '$_id',
        shipmentCount: 1,
        sales: 1,
        expense: 1,
        codAmount: 1,
        profit: { $subtract: ['$sales', '$expense'] }
      }
    },
    { $sort: { group: 1 } }
  ]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.shipmentCount += r.shipmentCount;
      acc.sales += r.sales;
      acc.expense += r.expense;
      acc.profit += r.profit;
      acc.codAmount += r.codAmount;
      return acc;
    },
    { shipmentCount: 0, sales: 0, expense: 0, profit: 0, codAmount: 0 }
  );

  return { rows, totals, groupBy };
}

async function getBookingSummary() {
  const [byStatus, byPaymentType, byBusinessType, totals] = await Promise.all([
    Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]),
    Shipment.aggregate([
      { $group: { _id: '$paymentType', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $project: { _id: 0, paymentType: '$_id', count: 1, amount: 1 } }
    ]),
    Shipment.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $project: { _id: 0, businessType: '$_id', count: 1 } }
    ]),
    Shipment.aggregate([
      {
        $group: {
          _id: null,
          totalShipments: { $sum: 1 },
          totalRevenue: { $sum: '$clientCharges.total' },
          totalWeight: { $sum: '$weightDetails.actualWeight' }
        }
      }
    ])
  ]);

  return {
    byStatus,
    byPaymentType,
    byBusinessType,
    totals: totals[0] || { totalShipments: 0, totalRevenue: 0, totalWeight: 0 }
  };
}

// Reference product's "Vendor Contribution" report — revenue/expense/profit
// contributed by each vendor over a date range.
async function getVendorContribution({ fromDate, toDate, vendorId, clientId }) {
  const match = { 'forwarding.vendorId': { $ne: null } };
  if (fromDate || toDate) {
    match.bookingDate = {};
    if (fromDate) match.bookingDate.$gte = new Date(fromDate);
    if (toDate) match.bookingDate.$lte = new Date(toDate);
  }
  if (vendorId) match['forwarding.vendorId'] = new mongoose.Types.ObjectId(vendorId);
  if (clientId) match.clientId = new mongoose.Types.ObjectId(clientId);

  const rows = await Shipment.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$forwarding.vendorId',
        shipments: { $sum: 1 },
        revenue: { $sum: '$clientCharges.total' },
        expense: { $sum: '$vendorCharges.total' }
      }
    },
    { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
    { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        vendorId: '$_id',
        vendorName: '$vendor.name',
        vendorCode: '$vendor.vendorCode',
        shipments: 1,
        revenue: 1,
        expense: 1,
        profit: { $subtract: ['$revenue', '$expense'] }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.shipments += r.shipments;
      acc.revenue += r.revenue;
      acc.expense += r.expense;
      acc.profit += r.profit;
      return acc;
    },
    { shipments: 0, revenue: 0, expense: 0, profit: 0 }
  );

  const rowsWithShare = rows.map((r) => ({
    ...r,
    sharePercent: totals.revenue > 0 ? Math.round((r.revenue / totals.revenue) * 1000) / 10 : 0
  }));

  return { rows: rowsWithShare, totals };
}

// Reference product's "Trend Report" (Down Traders And Up Traders) — shipment
// volume per month over the last N months (optionally scoped to one client),
// one row per period with month-over-month % change, matching what the
// Trend Report chart/table render. This is a simplified rollup (documented
// placeholder — the reference product's exact per-client up/down
// classification thresholds aren't recoverable from the reference markup
// alone; a per-client breakdown can be added later by re-running this with
// each clientId).
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function getTrendReport({ months = 3, clientId } = {}) {
  const monthCount = Math.min(Math.max(parseInt(months, 10) || 3, 1), 12);
  const since = new Date();
  since.setMonth(since.getMonth() - monthCount + 1);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const match = { bookingDate: { $gte: since } };
  if (clientId) match.clientId = new mongoose.Types.ObjectId(clientId);

  const grouped = await Shipment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: '$bookingDate' }, month: { $month: '$bookingDate' } },
        shipments: { $sum: 1 },
        revenue: { $sum: '$clientCharges.total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const byKey = new Map(grouped.map((g) => [`${g._id.year}-${g._id.month}`, g]));

  const rows = [];
  const cursor = new Date(since);
  for (let i = 0; i < monthCount; i += 1) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const g = byKey.get(`${year}-${month}`);
    rows.push({
      label: `${MONTH_LABELS[month - 1]} ${year}`,
      year,
      month,
      shipments: g?.shipments || 0,
      revenue: g?.revenue || 0
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const withChange = rows.map((r, i) => {
    if (i === 0) return { ...r, changePercent: null };
    const prev = rows[i - 1].shipments;
    const changePercent = prev > 0 ? Math.round(((r.shipments - prev) / prev) * 1000) / 10 : null;
    return { ...r, changePercent };
  });

  return { rows: withChange, months: monthCount };
}

// Reference product's "User Logs" report — a paginated, filterable view of
// AuditLog, which every Tier-1 mutation in this codebase already writes to.
async function getUserLogs({ page = 1, limit = 20, userId, formName, logType, actionDescription, refNo, fromDate, toDate } = {}) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const filter = {};
  if (userId) filter.userId = userId;
  if (formName) filter.formName = new RegExp(formName, 'i');
  if (logType) filter.action = logType;
  if (actionDescription) filter.actionDescription = new RegExp(actionDescription, 'i');
  if (refNo) filter.refNo = new RegExp(refNo, 'i');
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'userCode name email')
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l),
    AuditLog.countDocuments(filter)
  ]);

  return { items, total, page: p, limit: l };
}

// Reference product's "Client Outstanding" report. Placeholder logic
// (documented): since this pass has no ledger/payment-reconciliation
// engine, "outstanding" is approximated as the sum of clientCharges.total
// for CREDIT-payment shipments that aren't cancelled — i.e. amounts billed
// on credit terms with no linked payment record yet.
async function getClientOutstanding({ fromDate, toDate, clientId } = {}) {
  const match = { paymentType: 'CREDIT', isCancelled: { $ne: true } };
  if (fromDate || toDate) {
    match.bookingDate = {};
    if (fromDate) match.bookingDate.$gte = new Date(fromDate);
    if (toDate) match.bookingDate.$lte = new Date(toDate);
  }
  if (clientId) match.clientId = new mongoose.Types.ObjectId(clientId);

  const rows = await Shipment.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$clientId',
        shipmentCount: { $sum: 1 },
        outstanding: { $sum: '$clientCharges.total' }
      }
    },
    { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' } },
    { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        clientId: '$_id',
        clientName: '$client.name',
        clientCode: '$client.clientCode',
        shipmentCount: 1,
        outstanding: 1
      }
    },
    { $sort: { outstanding: -1 } }
  ]);

  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);

  return { rows, totalOutstanding };
}

module.exports = {
  getSalesReport,
  getBookingSummary,
  getVendorContribution,
  getTrendReport,
  getUserLogs,
  getClientOutstanding
};
