const { NewsPost, User } = require('../models/models')
const ApiError = require('../error/ApiError')

class NewsPostController {
    async create(req, res, next) {
        try {
            const { title, description } = req.body;
            const news = await NewsPost.create({ 
                title, 
                description,
                userId: req.user.id 
            });
            return res.json(news);
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        try {
            const news = await NewsPost.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'email']
                }]
            });
            return res.json(news);
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const news = await NewsPost.findByPk(id, {
                include: [{
                    model: User,
                    attributes: ['id', 'email']
                }]
            });
            
            if (!news) {
                return next(ApiError.notFound('Новость не найдена'))
            }
            
            return res.json(news);
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }
    
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const news = await NewsPost.findByPk(id);
            
            if (!news) {
                return next(ApiError.notFound('Новость не найдена'))
            }
            
            // Проверка прав доступа
            if (req.user.role === 'MOD' && news.userId !== req.user.id) {
                return next(ApiError.forbidden('Можно редактировать только свои новости'))
            }
            
            const [updated] = await NewsPost.update(req.body, { 
                where: { id } 
            });
            
            const updatedPost = await NewsPost.findByPk(id);
            return res.json(updatedPost);
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const news = await NewsPost.findByPk(id);
            
            if (!news) {
                return next(ApiError.notFound('Новость не найдена'))
            }
            
            if (req.user.role === 'MOD' && news.userId !== req.user.id) {
                return next(ApiError.forbidden('Можно удалять только свои новости'))
            }
            
            const deleted = await NewsPost.destroy({ where: { id } });
            return res.json({ success: true });
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }
}

module.exports = new NewsPostController()