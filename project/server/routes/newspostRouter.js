const Router = require('express')
const router = new Router()
const newspostController = require('../controllers/newspostController')
const { requireRole } = require('../middleware/auth')
const { ROLES } = require('../constants/roles')

router.post('/', requireRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN), newspostController.create)
router.get('/', newspostController.getAll)
router.get('/:id', newspostController.getOne)
router.put('/:id', requireRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN), newspostController.update)
router.delete('/:id', requireRole(ROLES.MOD, ROLES.ADMIN), newspostController.delete)
// Legacy POST /like/:id removed: the counter column was dropped in Stage 1.
// Use POST/DELETE /api/news/:newsPostId/like from modules/likes instead.

module.exports = router
