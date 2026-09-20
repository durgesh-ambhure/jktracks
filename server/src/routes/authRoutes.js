const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authValidators = require('../validators/authValidators');

const router = express.Router();

// Rate limit auth endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later', errors: [] }
});

router.use(authLimiter);
console.log("yesssss");


router.post('/login', validate(authValidators.login), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', validate(authValidators.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidators.resetPassword), authController.resetPassword);
router.post('/change-password', authenticate, validate(authValidators.changePassword), authController.changePassword);

module.exports = router;
