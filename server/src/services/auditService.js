const AuditLog = require('../models/AuditLog');

// Writes an AuditLog entry. Called explicitly from controllers for every
// Tier-1 mutation (create/update/delete/login/logout/cancel) per
// CONTRACT.md non-negotiables. Never throws — a failed audit write should
// not fail the parent request.
async function logAction(req, {
  action,
  entity,
  entityId = null,
  formName = '',
  actionDescription = '',
  refNo = '',
  previousValue = null,
  newValue = null
}) {
  try {
    await AuditLog.create({
      userId: req.user ? req.user.id : null,
      action,
      entity,
      entityId,
      formName,
      actionDescription,
      refNo,
      previousValue,
      newValue,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'] || ''
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auditService] failed to write audit log:', err.message);
  }
}

module.exports = { logAction };
