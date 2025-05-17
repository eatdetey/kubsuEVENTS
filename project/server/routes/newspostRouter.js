const Router = require('express')
const router = new Router()
const newspostController = require('../controllers/newspostController')
const checkroleMiddleware = require('../middleware/checkRoleMiddleware')

router.post('/', checkroleMiddleware(['ADMIN', 'MOD']), newspostController.create)
router.get('/', newspostController.getAll)
router.get('/:id', newspostController.getOne)
router.put('/:id', checkroleMiddleware(['ADMIN', 'MOD']), newspostController.update)
router.delete('/:id', checkroleMiddleware(['ADMIN']), newspostController.delete)

module.exports = router
