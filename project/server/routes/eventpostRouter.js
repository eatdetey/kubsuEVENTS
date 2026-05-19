const Router = require('express')
const router = new Router()
const eventpostController = require('../controllers/eventpostController')
const { requireRole } = require('../middleware/auth')
const { ROLES } = require('../constants/roles')

router.get('/', eventpostController.getAll)
router.get('/:id', eventpostController.getOne)
router.post('/', requireRole(ROLES.MOD, ROLES.ADMIN), eventpostController.create)
router.put('/:id', requireRole(ROLES.MOD, ROLES.ADMIN), eventpostController.update)

module.exports = router
