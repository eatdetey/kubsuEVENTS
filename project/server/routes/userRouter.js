const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const { requireAuth } = require('../middleware/auth')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', requireAuth, userController.check)
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);

module.exports = router
