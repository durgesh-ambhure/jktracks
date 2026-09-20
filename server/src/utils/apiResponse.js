/**
 * Response envelope helpers enforcing docs/CONTRACT.md exactly:
 *   success (single):  { success: true, message, data }
 *   success (list):    { success: true, data: [...], pagination: {...} }
 *   error:             { success: false, message, errors: [{ field, message }] }
 */

function sendSuccess(res, { message = 'OK', data = null, statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendList(res, { data = [], pagination, statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, data, pagination });
}

function sendError(res, { message = 'Something went wrong', errors = [], statusCode = 500 } = {}) {
  return res.status(statusCode).json({ success: false, message, errors });
}

function buildPagination({ page, limit, total }) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 20, 1);
  return {
    page: p,
    limit: l,
    total,
    totalPages: Math.max(Math.ceil(total / l), 1)
  };
}

module.exports = { sendSuccess, sendList, sendError, buildPagination };
