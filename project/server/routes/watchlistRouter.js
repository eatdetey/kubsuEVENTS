const Router = require('express')
const router = new Router()
const watchlistController = require('../controllers/watchlistController')

router.get('/', watchlistController.getAll)

module.exports = router
