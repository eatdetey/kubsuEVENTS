const Router = require('express')
const router = new Router()
const newspostController = require('../controllers/newspostController')
const { requireAuth, requireRole } = require('../middleware/auth')
const { ROLES } = require('../constants/roles')

router.post('/', requireRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN), newspostController.create)
router.get('/', newspostController.getAll)
router.get('/:id', newspostController.getOne)
router.put('/:id', requireRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN), newspostController.update)
router.delete('/:id', requireRole(ROLES.MOD, ROLES.ADMIN), newspostController.delete)
router.post('/like/:id', requireAuth, newspostController.like);


module.exports = router
