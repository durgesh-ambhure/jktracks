const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendList, buildPagination } = require('../utils/apiResponse');
const { buildListQuery } = require('../utils/queryHelper');
const { logAction } = require('../services/auditService');

async function generateUserCode() {
  const count = await User.countDocuments({});
  return String(1000 + count + 1);
}

// Exposes `permissionOverrides` as `permissions` too, so the User Rights
// page (which edits per-user overrides, distinct from the role-level Group
// Rights page) can read/write a plain `permissions` array without needing
// to know the underlying schema field name.
function withPermissionsAlias(doc) {
  const obj = doc.toObject();
  obj.permissions = obj.permissionOverrides || [];
  return obj;
}

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, filter, sort } = buildListQuery(req.query, ['name', 'email', 'userCode']);

  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  sendList(res, { data: items.map(withPermissionsAlias), pagination: buildPagination({ page, limit, total }) });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, { data: withPermissionsAlias(user) });
});

const createUser = asyncHandler(async (req, res) => {
  const { password, ...rest } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userCode = rest.userCode || (await generateUserCode());

  const user = await User.create({ ...rest, userCode, passwordHash });

  await logAction(req, {
    action: 'INSERT',
    entity: 'User',
    entityId: user._id,
    formName: 'Users',
    actionDescription: `Created user ${user.email}`,
    newValue: { email: user.email, role: user.role }
  });

  sendSuccess(res, { message: 'User created', data: withPermissionsAlias(user), statusCode: 201 });
});

const updateUser = asyncHandler(async (req, res) => {
  // `permissions` (from the User Rights page) maps to permissionOverrides —
  // pulled out explicitly because Mongoose's default strict schema mode
  // silently drops any key on Object.assign(...).save() that isn't a real
  // schema path, so a raw `permissions` field would otherwise no-op.
  const { password, permissions, ...rest } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const previousValue = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    permissionOverrides: user.permissionOverrides
  };

  Object.assign(user, rest);
  if (Array.isArray(permissions)) {
    user.permissionOverrides = permissions;
  }
  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  await user.save();

  await logAction(req, {
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    formName: 'Users',
    actionDescription: `Updated user ${user.email}`,
    previousValue,
    newValue: rest
  });

  sendSuccess(res, { message: 'User updated', data: withPermissionsAlias(user) });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  await user.deleteOne();

  await logAction(req, {
    action: 'DELETE',
    entity: 'User',
    entityId: user._id,
    formName: 'Users',
    actionDescription: `Deleted user ${user.email}`
  });

  sendSuccess(res, { message: 'User deleted', data: {} });
});

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
