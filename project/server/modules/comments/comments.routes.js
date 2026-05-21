const Router = require('express');
const router = new Router();
const commentsController = require('./comments.controller');
const { requireAuth } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');

// Paths are absolute from the /api mount point.
router.get('/news/:newsPostId/comments', asyncHandler(commentsController.list));
router.post('/news/:newsPostId/comments', requireAuth, asyncHandler(commentsController.create));
router.delete(
  '/news/:newsPostId/comments/:commentId',
  requireAuth,
  asyncHandler(commentsController.remove)
);

module.exports = router;
