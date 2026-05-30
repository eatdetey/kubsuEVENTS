const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const eventpostRouter = require('./eventpostRouter')
const newspostRouter = require('./newspostRouter')
const likesRouter = require('../modules/likes/likes.routes')
const commentsRouter = require('../modules/comments/comments.routes')
const categoriesRouter = require('../modules/categories/categories.routes')
const registrationsRouter = require('../modules/registrations/registrations.routes')
const usersAdminRouter = require('../modules/users/users.routes')
const favoritesRouter = require('../modules/favorites/favorites.routes')

router.use('/user', userRouter)
router.use('/eventpost', eventpostRouter)
router.use('/newspost', newspostRouter)
// /api/watchlist removed — replaced by /api/favorites and /api/events/.../register.

// Stage 3+ modules — absolute paths, mounted at the /api root.
router.use('/', likesRouter)
router.use('/', commentsRouter)
router.use('/', categoriesRouter)
router.use('/', registrationsRouter)
router.use('/', usersAdminRouter)
router.use('/', favoritesRouter)

module.exports = router
