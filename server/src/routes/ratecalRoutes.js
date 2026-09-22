const express = require('express');
const { authenticate, requirePermission } = require('../middleware/auth');
const { compareRates } = require('../controllers/ratecalController');

const router = express.Router();

router.use(authenticate);
router.post('/compare', requirePermission('ratecal.read'), compareRates);

module.exports = router;
