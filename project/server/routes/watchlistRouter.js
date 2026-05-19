const Router = require('express');
const router = new Router();
const watchlistController = require('../controllers/watchlistController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, watchlistController.addToWatchlist);
router.delete('/:eventId', requireAuth, watchlistController.removeFromWatchlist);
router.get('/', requireAuth, watchlistController.getMyWatchlist);

module.exports = router;
