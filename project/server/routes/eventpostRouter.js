const Router = require('express')
const router = new Router()
const eventpostController = require('../controllers/eventpostController')
const { requireRole } = require('../middleware/auth')
const optionalAuth = require('../middleware/optionalAuth')
const { ROLES } = require('../constants/roles')

// optionalAuth on the read routes lets the controller populate
// isFavorited/isRegistered for authenticated callers without forcing a 401
// on anonymous browsing.
router.get('/', optionalAuth, eventpostController.getAll)
router.get('/:id', optionalAuth, eventpostController.getOne)
router.post('/', requireRole(ROLES.MOD, ROLES.ADMIN), eventpostController.create)
router.put('/:id', requireRole(ROLES.MOD, ROLES.ADMIN), eventpostController.update)

module.exports = router
