const Router = require('express')
const router = new Router()
const newspostController = require('../controllers/newspostController')
const checkroleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', checkroleMiddleware('ORG'), newspostController.create)
router.get('/', newspostController.getAll)
router.get('/:id', newspostController.getOne)

module.exports = router
