const Router = require('express');
const router = new Router();
const usersController = require('./users.controller');
const { requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants/roles');
const asyncHandler = require('../../utils/asyncHandler');

// Admin user management. Mounted at the /api root.
router.patch(
  '/users/:userId/role',
  requireRole(ROLES.ADMIN),
  asyncHandler(usersController.changeRole)
);

module.exports = router;
