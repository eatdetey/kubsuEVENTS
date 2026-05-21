const Router = require('express');
const router = new Router();
const categoriesController = require('./categories.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants/roles');
const asyncHandler = require('../../utils/asyncHandler');

// --- Categories ------------------------------------------------------------
router.get('/categories', asyncHandler(categoriesController.list));
router.post(
  '/categories',
  requireRole(ROLES.MOD, ROLES.ADMIN),
  asyncHandler(categoriesController.create)
);
router.put(
  '/categories/:id',
  requireRole(ROLES.MOD, ROLES.ADMIN),
  asyncHandler(categoriesController.update)
);
router.delete(
  '/categories/:id',
  requireRole(ROLES.ADMIN),
  asyncHandler(categoriesController.remove)
);

// --- Current user's category preferences -----------------------------------
router.get(
  '/users/me/preferences',
  requireAuth,
  asyncHandler(categoriesController.getMyPreferences)
);
router.put(
  '/users/me/preferences',
  requireAuth,
  asyncHandler(categoriesController.updateMyPreferences)
);

module.exports = router;
