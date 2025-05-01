const Router = require('express')
const router = new Router()
const eventpostController = require('../controllers/eventpostController')
const checkroleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', checkroleMiddleware('ORG'), eventpostController.create)
router.get('/', eventpostController.getAll)
router.get('/:id', eventpostController.getOne)

module.exports = router
