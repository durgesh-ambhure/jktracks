const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the Bearer access token and attaches req.user = { id, role,
// permissions, ... } for downstream handlers / requirePermission.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.sub).select('-passwordHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer active');
  }

  req.user = {
    id: user._id.toString(),
    userCode: user.userCode,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: decoded.permissions || [],
    companyCode: user.companyCode
  };

  next();
});

// requirePermission('shipments.read') — SUPER_ADMIN bypasses all checks.
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }
    return next(ApiError.forbidden(`Missing permission: ${permission}`));
  };
}

module.exports = { authenticate, requirePermission };
