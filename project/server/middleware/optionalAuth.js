const jwt = require('jsonwebtoken');

// For public endpoints that still want to know who the caller is when a token
// happens to be present (e.g. "did the current user like this?"). Unlike
// requireAuth it never rejects: no token / bad token simply means anonymous.
module.exports = function optionalAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const header = req.headers.authorization;
  if (!header) return next();
  const token = header.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.SECRET_KEY);
  } catch (e) {
    // Invalid token on a public route — treat the caller as anonymous.
  }
  return next();
};
