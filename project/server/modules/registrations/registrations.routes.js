const Router = require('express');
const router = new Router();
const registrationsController = require('./registrations.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants/roles');
const asyncHandler = require('../../utils/asyncHandler');

// Static path declared before the parameterized ones so '/events/check-in'
// is never shadowed by '/events/:eventId/...'.
router.post(
  '/events/check-in',
  requireRole(ROLES.SECURITY, ROLES.MOD, ROLES.ADMIN),
  asyncHandler(registrationsController.checkIn)
);

router.post(
  '/events/:eventId/register',
  requireAuth,
  asyncHandler(registrationsController.register)
);
router.get(
  '/events/:eventId/ticket',
  requireAuth,
  asyncHandler(registrationsController.getTicket)
);
router.delete(
  '/events/:eventId/register',
  requireAuth,
  asyncHandler(registrationsController.cancel)
);
router.get(
  '/events/:eventId/registrations',
  requireRole(ROLES.MOD, ROLES.ADMIN),
  asyncHandler(registrationsController.listRegistrations)
);

// Personal-cabinet endpoint: returns the current user's registrations
// with light event payloads (id/title/starts/place/img).
router.get(
  '/users/me/registrations',
  requireAuth,
  asyncHandler(registrationsController.listMyRegistrations)
);

module.exports = router;
