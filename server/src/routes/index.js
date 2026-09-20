const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const customerRoutes = require('./customerRoutes');
const courierRoutes = require('./courierRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const trackingRoutes = require('./trackingRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');
const masterRoutes = require('./masterRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const importRoutes = require('./importRoutes');
const kycRoutes = require('./kycRoutes');
const accountingRoutes = require('./accountingRoutes');
const settingsRoutes = require('./settingsRoutes');

const router = express.Router();

// Tier 1
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/customers', customerRoutes);
router.use('/couriers', courierRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/tracking', trackingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

// Tier 2
router.use('/masters', masterRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/imports', importRoutes);
router.use('/kyc', kycRoutes);
router.use('/accounting', accountingRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
