const Router = require('express');
const router = new Router();
const likesController = require('./likes.controller');
const { requireAuth } = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');
const asyncHandler = require('../../utils/asyncHandler');

// Paths are absolute from the /api mount point.
router.post('/news/:newsPostId/like', requireAuth, asyncHandler(likesController.like));
router.delete('/news/:newsPostId/like', requireAuth, asyncHandler(likesController.unlike));
router.get('/news/:newsPostId/likes/count', optionalAuth, asyncHandler(likesController.count));

module.exports = router;
