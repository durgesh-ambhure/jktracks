const Role = require('../models/Role');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');

const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({}).sort({ name: 1 });
  sendSuccess(res, { data: roles });
});

// Powers "User Group" — creates a custom group (isSystem: false). Name is upper-cased/trimmed
// so it lines up with how role names are compared/assigned elsewhere (User.role).
const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;
  if (!name || !String(name).trim()) throw ApiError.badRequest('Group name is required');
  const normalized = String(name).trim().toUpperCase();

  const existing = await Role.findOne({ name: normalized });
  if (existing) throw ApiError.conflict(`A role/group named "${normalized}" already exists`);

  const role = await Role.create({
    name: normalized,
    permissions: Array.isArray(permissions) ? permissions : [],
    isSystem: false
  });

  await logAction(req, {
    action: 'INSERT',
    entity: 'Role',
    entityId: role._id,
    formName: 'UserGroup',
    actionDescription: `Created custom group ${normalized}`
  });

  sendSuccess(res, { message: 'Group created', data: role, statusCode: 201 });
});

// Powers the "Group Rights" page — replaces a role's whole permission set.
// SUPER_ADMIN is intentionally excluded: it always has full access via the
// '*' short-circuit in buildUserPayload/requirePermission, regardless of
// whatever is stored here, so editing it would be a no-op that could
// mislead an admin into thinking they'd restricted it.
const updateRole = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { permissions } = req.body;

  if (name === 'SUPER_ADMIN') {
    throw ApiError.badRequest('SUPER_ADMIN permissions cannot be edited — it always has full access');
  }
  if (!Array.isArray(permissions)) {
    throw ApiError.badRequest('permissions must be an array of strings');
  }

  const role = await Role.findOneAndUpdate(
    { name },
    { permissions },
    { new: true, upsert: false }
  );
  if (!role) throw ApiError.notFound('Role not found');

  await logAction(req, {
    action: 'UPDATE',
    entity: 'Role',
    entityId: role._id,
    formName: 'GroupRights',
    actionDescription: `Updated permissions for role ${name}`,
    newValue: { permissions }
  });

  sendSuccess(res, { message: 'Role permissions updated', data: role });
});

// Powers "User Group" — deletes a custom group. System (seeded) roles can never be deleted,
// and a group still assigned to at least one user can't be deleted out from under them.
const deleteRole = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const role = await Role.findOne({ name });
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem) throw ApiError.badRequest('System roles cannot be deleted');

  const usersWithRole = await User.countDocuments({ role: role.name });
  if (usersWithRole > 0) {
    throw ApiError.conflict(`Cannot delete "${role.name}" — ${usersWithRole} user(s) are still assigned to it`);
  }

  await role.deleteOne();

  await logAction(req, {
    action: 'DELETE',
    entity: 'Role',
    entityId: role._id,
    formName: 'UserGroup',
    actionDescription: `Deleted custom group ${role.name}`
  });

  sendSuccess(res, { message: 'Group deleted', data: {} });
});

module.exports = { listRoles, createRole, updateRole, deleteRole };
