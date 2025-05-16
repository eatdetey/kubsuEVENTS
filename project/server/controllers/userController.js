const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Watchlist} = require('../models/models')

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role}, 
        process.env.SECRET_KEY, 
        {expiresIn: '24h'}
    )
}

class UserController{
    async registration(req, res) {
        const {email, password, role} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'))
        }
        const candidate = await User.findOne({where:{email}})
        if (candidate) {
            return next(ApiError.badRequest('User с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassword})
        const watchlist = await Watchlist.create({userId: user.id})
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where:{email}})
        if (!user){
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }

    // Добавляем в userController.js
    async getProfile(req, res, next) {
    try {
        const { id } = req.user;
        const user = await User.findOne({
        where: { id },
        attributes: ['id', 'email', 'role', 'createdAt'] // Исключаем пароль
        });
        return res.json(user);
    } catch (e) {
        next(ApiError.internal('Ошибка при получении профиля'));
    }
    }

    async updateProfile(req, res, next) {
    try {
        const { id } = req.user;
        const { email } = req.body;
        
        if (email) {
        const candidate = await User.findOne({ where: { email } });
        if (candidate && candidate.id !== id) {
            return next(ApiError.badRequest('Email уже используется'));
        }
        }
        
        await User.update(req.body, { where: { id } });
        const user = await User.findByPk(id, {
        attributes: ['id', 'email', 'role', 'createdAt']
        });
        return res.json(user);
    } catch (e) {
        next(ApiError.internal('Ошибка при обновлении профиля'));
    }
    }

    async getWatchlist(req, res, next) {
    try {
        const { id } = req.user;
        
        const watchlist = await Watchlist.findAll({
        where: { 
            user_id: id,
            eventpost_id: { [Op.not]: null }
        },
        include: [{
            model: EventPost,
            as: 'event_post',
            required: true, // INNER JOIN вместо LEFT JOIN
            attributes: ['id', 'title', 'description', 'starts', 'place', 'img', 'status']
        }],
        order: [['created_at', 'DESC']]
        });

        return res.json(watchlist);
    } catch (e) {
        console.error('Watchlist error:', e);
        next(ApiError.internal('Ошибка при получении избранного'));
    }
    }
}

module.exports = new UserController()