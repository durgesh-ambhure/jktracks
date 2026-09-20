const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { logAction } = require('../services/auditService');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};


async function buildUserPayload(user) {
  const role = await Role.findOne({ name: user.role });
  const permissions =
    user.role === 'SUPER_ADMIN'
      ? ['*']
      : Array.from(new Set([...(role?.permissions || []), ...(user.permissionOverrides || [])]));
  return {
    user: {
      id: user._id.toString(),
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
      companyCode: user.companyCode
    },
    permissions
  };
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("req.body", req.body);
  

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { user: userPayload, permissions } = await buildUserPayload(user);

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, permissions });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  user.lastLoginAt = new Date();
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  await logAction(req, {
    action: 'LOGIN',
    entity: 'User',
    entityId: user._id,
    formName: 'Login',
    actionDescription: `User ${user.email} logged in`
  });

  sendSuccess(res, { message: 'Login successful', data: { user: userPayload, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

  if (req.user) {
    await logAction(req, {
      action: 'LOGOUT',
      entity: 'User',
      entityId: req.user.id,
      formName: 'Logout',
      actionDescription: `User ${req.user.email} logged out`
    });
  }

  sendSuccess(res, { message: 'Logged out', data: {} });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer active');
  }

  const { permissions } = await buildUserPayload(user);
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, permissions });

  sendSuccess(res, { message: 'Token refreshed', data: { accessToken } });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  const { user: userPayload } = await buildUserPayload(user);
  sendSuccess(res, { message: 'OK', data: { user: userPayload } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same way whether or not the user exists, to avoid
  // account enumeration. Token is generated + stored only if user exists.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();
    // NOTE: sending the actual email is out of scope for this pass; in a
    // real deployment this token would be emailed to the user. We log it
    // server-side only so the flow is testable end-to-end without an SMTP
    // integration.
    // eslint-disable-next-line no-console
    console.log(`[auth] password reset token for ${email}: ${token}`);
  }

  sendSuccess(res, { message: 'If that email exists, a reset link has been sent', data: {} });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw ApiError.badRequest('Reset token is invalid or has expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    formName: 'ResetPassword',
    actionDescription: `Password reset for ${user.email}`
  });

  sendSuccess(res, { message: 'Password reset successful', data: {} });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    formName: 'ChangePassword',
    actionDescription: `Password changed for ${user.email}`
  });

  sendSuccess(res, { message: 'Password changed successfully', data: {} });
});

module.exports = { login, logout, refresh, me, forgotPassword, resetPassword, changePassword };
