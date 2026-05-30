const Router = require('express');
const router = new Router();
const favoritesController = require('./favorites.controller');
const { requireAuth } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');

router.get('/favorites', requireAuth, asyncHandler(favoritesController.list));
router.post('/favorites/:eventPostId', requireAuth, asyncHandler(favoritesController.add));
router.delete('/favorites/:eventPostId', requireAuth, asyncHandler(favoritesController.remove));

module.exports = router;
