const Router = require('express')
const router = new Router()
const eventpostController = require('../controllers/eventpostController')
const checkroleMiddleware = require('../middleware/checkRoleMiddleware')

router.get('/', eventpostController.getAll)
router.get('/:id', eventpostController.getOne)
router.post('/', checkroleMiddleware('ADMIN'), eventpostController.create)

module.exports = router
