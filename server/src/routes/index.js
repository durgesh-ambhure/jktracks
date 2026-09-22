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
const manifestRoutes = require('./manifestRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const importRoutes = require('./importRoutes');
const kycRoutes = require('./kycRoutes');
const accountingRoutes = require('./accountingRoutes');
const settingsRoutes = require('./settingsRoutes');
const rateCardRoutes = require('./rateCardRoutes');
const { taxRateRouter, fuelSurchargeRouter, serviceConfigRouter } = require('./taxFuelServiceRoutes');
const ratecalRoutes = require('./ratecalRoutes');
const { vendorAccountRouter, clientVasRouter } = require('./vendorClientDetailRoutes');
const vendorApiLogRoutes = require('./vendorApiLogRoutes');

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
router.use('/manifests', manifestRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/imports', importRoutes);
router.use('/kyc', kycRoutes);
router.use('/accounting', accountingRoutes);
router.use('/settings', settingsRoutes);
router.use('/rate-cards', rateCardRoutes);
router.use('/tax-rates', taxRateRouter);
router.use('/fuel-surcharges', fuelSurchargeRouter);
router.use('/service-configs', serviceConfigRouter);
router.use('/ratecal', ratecalRoutes);
router.use('/vendor-accounts', vendorAccountRouter);
router.use('/client-vas', clientVasRouter);
router.use('/vendor-api-logs', vendorApiLogRoutes);

module.exports = router;
