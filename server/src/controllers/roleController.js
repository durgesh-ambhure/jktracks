const Role = require('../models/Role');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');

const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({}).sort({ name: 1 });
  sendSuccess(res, { data: roles });
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

module.exports = { listRoles, updateRole };
