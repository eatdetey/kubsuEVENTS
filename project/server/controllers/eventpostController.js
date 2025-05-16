const { EventPost } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class EventPostController {
    async create(req, res, next) {
    try {
        const { title, userId, description, start_time, place, status } = req.body;
        
        let fileName = null;
        if (req.files?.img) {
            const { img } = req.files;
            const allowedTypes = ['image/jpeg', 'image/png'];
            
            if (!allowedTypes.includes(img.mimetype)) {
                return next(ApiError.badRequest('Допустимы только JPEG/PNG'));
            }

            fileName = uuid.v4() + path.extname(img.name);
            const staticPath = path.resolve(__dirname, '..', 'static');
            
            if (!fs.existsSync(staticPath)) {
                fs.mkdirSync(staticPath, { recursive: true });
            }

            await img.mv(path.join(staticPath, fileName));
        }

        const eventpost = await EventPost.create({
            title,
            userId,
            description,
            start_time,
            place,
            status,
            img: fileName // Будет null, если файл не загружен
        });

        return res.json({
            ...eventpost.get(),
            img: fileName 
                ? `${req.protocol}://${req.get('host')}/static/${fileName}`
                : null
        });

        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }   

    async getAll(req, res) {
    try {
        const { status } = req.query;
        let eventposts;
        
        if (!status) {
            eventposts = await EventPost.findAll();
        } else {
            eventposts = await EventPost.findAll({ where: { status } });
        }

        // Добавляем полные URL только для существующих изображений
        const postsWithUrls = eventposts.map(post => {
            const postData = post.get();
            return {
                ...postData,
                img: postData.img 
                    ? `${req.protocol}://${req.get('host')}/static/${postData.img}`
                    : null // или дефолтный URL изображения-заглушки
            };
        });

        return res.json(postsWithUrls);
    } catch (e) {
        next(ApiError.internal(e.message));
    }
}

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const eventpost = await EventPost.findOne({ where: { id } });
            
            if (!eventpost) {
                return next(ApiError.notFound('Запись не найдена'));
            }

            // Добавляем полный URL к изображению
            const imageUrl = `${req.protocol}://${req.get('host')}/static/${eventpost.img}`;
            return res.json({ ...eventpost.get(), img: imageUrl });

        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }
}

module.exports = new EventPostController();