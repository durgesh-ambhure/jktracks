const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInvoice, regenerateInvoice, cancelIrn } = require('../validators/invoiceValidators');

const router = express.Router();

// Real model (server/src/models/Invoice.js) generated from actual Shipment data — replaces
// the earlier GenericRecord{type:'invoices'} placeholder. See invoiceGeneration.service.js.
router.use(authenticate);

router.get('/', requirePermission('invoices.read'), invoiceController.listInvoices);
router.post('/', requirePermission('invoices.create'), validate(createInvoice), invoiceController.createInvoice);
router.get('/:id', requirePermission('invoices.read'), invoiceController.getInvoice);
router.post('/:id/regenerate', requirePermission('invoices.update'), validate(regenerateInvoice), invoiceController.regenerateInvoice);
router.post('/:id/generate-irn', requirePermission('invoices.update'), invoiceController.generateIrn);
router.post('/:id/cancel-irn', requirePermission('invoices.update'), validate(cancelIrn), invoiceController.cancelIrn);
router.delete('/:id', requirePermission('invoices.delete'), invoiceController.deleteInvoice);

module.exports = router;
