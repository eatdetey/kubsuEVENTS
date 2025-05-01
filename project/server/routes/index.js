const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const eventpostRouter = require('./eventpostRouter')
const newspostRouter = require('./newspostRouter')
const watchlistRouter = require('./watchlistRouter')

router.use('/user', userRouter)
router.use('/watchlist', watchlistRouter)
router.use('/eventpost', eventpostRouter)
router.use('/newspost', newspostRouter)

module.exports = router
