const express = require('express');
const RateCard = require('../models/RateCard');
const { makeModelController } = require('../controllers/modelCrudController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRateCard, updateRateCard } = require('../validators/rateCardValidators');

const router = express.Router();

const controller = makeModelController(RateCard, {
  entityLabel: 'Rate Card',
  searchFields: ['zone', 'serviceType'],
  populate: ['vendorId', 'clientId'],
  // ?partyType=VENDOR|CLIENT scopes the list — Vendor Rate Entry and Client Rate Entry both
  // hit this same resource, filtered by partyType.
  extraFilters: (req) => (req.query.partyType ? { partyType: req.query.partyType } : {})
});

router.use(authenticate);

router.get('/', requirePermission('invoices.read'), controller.list);
router.post('/', requirePermission('invoices.update'), validate(createRateCard), controller.create);
router.get('/:id', requirePermission('invoices.read'), controller.getOne);
router.patch('/:id', requirePermission('invoices.update'), validate(updateRateCard), controller.update);
router.delete('/:id', requirePermission('invoices.update'), controller.remove);

module.exports = router;
