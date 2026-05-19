const jwt = require('jsonwebtoken');
const { ROLE_HIERARCHY } = require('../constants/roles');

function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.split(' ')[1];
  if (!token) return null;
  return jwt.verify(token, process.env.SECRET_KEY);
}

function requireAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
}

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (req.method === 'OPTIONS') return next();
    try {
      const decoded = verifyToken(req);
      if (!decoded) {
        return res.status(401).json({ message: 'Не авторизован' });
      }
      req.user = decoded;
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Нет доступа' });
      }
      return next();
    } catch (e) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
  };
}

function requireMinRole(minRole) {
  const minLevel = ROLE_HIERARCHY[minRole];
  if (minLevel === undefined) {
    throw new Error(`requireMinRole: unknown role "${minRole}"`);
  }
  return function (req, res, next) {
    if (req.method === 'OPTIONS') return next();
    try {
      const decoded = verifyToken(req);
      if (!decoded) {
        return res.status(401).json({ message: 'Не авторизован' });
      }
      req.user = decoded;
      const userLevel = ROLE_HIERARCHY[decoded.role];
      if (userLevel === undefined || userLevel < minLevel) {
        return res.status(403).json({ message: 'Нет доступа' });
      }
      return next();
    } catch (e) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
  };
}

module.exports = { requireAuth, requireRole, requireMinRole };
