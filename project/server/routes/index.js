const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const eventpostRouter = require('./eventpostRouter')
const newspostRouter = require('./newspostRouter')
const watchlistRouter = require('./watchlistRouter')
const likesRouter = require('../modules/likes/likes.routes')
const commentsRouter = require('../modules/comments/comments.routes')

router.use('/user', userRouter)
router.use('/eventpost', eventpostRouter)
router.use('/newspost', newspostRouter)
router.use('/watchlist', watchlistRouter)

// Stage 3 modules — absolute paths, mounted at the /api root.
router.use('/', likesRouter)
router.use('/', commentsRouter)

module.exports = router
