const ServiceError = require('./ServiceError');

// Parses a route/path param expected to be a positive integer id.
// Throws ServiceError(400) on anything else.
function parseIntId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ServiceError(400, `Invalid ${name}`);
  }
  return n;
}

// Normalizes page/limit query params. page >= 1 (default 1),
// limit 1..100 (default 20).
function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = { parseIntId, parsePagination };
