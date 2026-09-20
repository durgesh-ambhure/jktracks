const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');

const NON_PENDING_STATUSES = ['DELIVERED', 'CANCELLED', 'RTO'];

async function getSummary() {
  const [
    totalShipments,
    delivered,
    pending,
    rto,
    revenueAgg,
    outstandingAgg,
    codAgg,
    recentShipments,
    statusBreakdown,
    revenueTrend
  ] = await Promise.all([
    Shipment.countDocuments({}),
    Shipment.countDocuments({ status: 'DELIVERED' }),
    Shipment.countDocuments({ status: { $nin: NON_PENDING_STATUSES } }),
    Shipment.countDocuments({ status: 'RTO' }),
    Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$clientCharges.total' } } }
    ]),
    Shipment.aggregate([
      {
        $match: {
          paymentType: 'CREDIT',
          status: { $nin: ['CANCELLED'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$clientCharges.total' } } }
    ]),
    Shipment.aggregate([
      { $match: { paymentType: 'COD', status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Shipment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('clientId', 'name clientCode')
      .lean(),
    Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]),
    getRevenueTrend()
  ]);

  return {
    totalShipments,
    delivered,
    pending,
    rto,
    revenue: round2(revenueAgg[0]?.total || 0),
    outstanding: round2(outstandingAgg[0]?.total || 0),
    codAmount: round2(codAgg[0]?.total || 0),
    recentShipments,
    statusBreakdown,
    revenueTrend
  };
}

async function getRevenueTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await Shipment.aggregate([
    { $match: { bookingDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$bookingDate' }, month: { $month: '$bookingDate' } },
        revenue: { $sum: '$clientCharges.total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Fill in any missing months in the 6-month window with zero.
  const result = [];
  const cursor = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i += 1) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const match = rows.find((r) => r._id.year === year && r._id.month === month);
    result.push({
      year,
      month,
      label: `${year}-${String(month).padStart(2, '0')}`,
      revenue: round2(match?.revenue || 0),
      count: match?.count || 0
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { getSummary };
