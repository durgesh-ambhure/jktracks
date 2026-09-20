const express = require('express');
const courierController = require('../controllers/courierController');
const { authenticate, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const courierValidators = require('../validators/courierValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('couriers.read'), courierController.listCouriers);
router.post('/', requirePermission('couriers.create'), validate(courierValidators.createCourier), courierController.createCourier);
router.get('/:id', requirePermission('couriers.read'), courierController.getCourier);
router.patch('/:id', requirePermission('couriers.update'), validate(courierValidators.updateCourier), courierController.updateCourier);
router.delete('/:id', requirePermission('couriers.delete'), courierController.deleteCourier);

module.exports = router;
