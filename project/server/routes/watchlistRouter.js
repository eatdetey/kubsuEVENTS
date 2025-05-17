const Router = require('express');
const router = new Router();
const watchlistController = require('../controllers/watchlistController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, watchlistController.addToWatchlist);
router.delete('/:eventId', authMiddleware, watchlistController.removeFromWatchlist);
router.get('/', authMiddleware, watchlistController.getMyWatchlist);

module.exports = router;
