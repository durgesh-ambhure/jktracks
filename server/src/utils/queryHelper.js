// Builds a Mongoose filter + pagination options from common list query params.
// searchFields: array of schema paths to $or/$regex search against `search`.
function buildListQuery(reqQuery, searchFields = []) {
  const page = Math.max(parseInt(reqQuery.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(reqQuery.limit, 10) || 20, 1), 200);
  const skip = (page - 1) * limit;

  const filter = {};
  if (reqQuery.search && searchFields.length) {
    const regex = new RegExp(escapeRegex(String(reqQuery.search)), 'i');
    filter.$or = searchFields.map((f) => ({ [f]: regex }));
  }

  let sort = { createdAt: -1 };
  if (reqQuery.sort) {
    const dir = reqQuery.sort.startsWith('-') ? -1 : 1;
    const field = reqQuery.sort.replace(/^-/, '');
    sort = { [field]: dir };
  }

  return { page, limit, skip, filter, sort };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { buildListQuery, escapeRegex };
