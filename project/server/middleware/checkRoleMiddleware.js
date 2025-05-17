const jwt = require('jsonwebtoken')

module.exports = function(allowedRoles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            return next()
        }
        try {
            const token = req.headers.authorization?.split(' ')[1]
            if (!token) {
                return res.status(401).json({message: 'Не авторизован'})
            }
            
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({message: "Нет доступа"})
            }
            
            req.user = decoded
            next()
        } catch(e) {
            console.error('Ошибка проверки токена:', e)
            return res.status(401).json({message: 'Не авторизован'})
        }
    }
}