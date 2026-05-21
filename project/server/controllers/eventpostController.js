const { EventPost } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { extractEventGeoFields } = require('../utils/eventGeoFields');

class EventPostController {
    async create(req, res, next) {
    try {
        const { title, userId, description, starts, place, status } = req.body;

        // Stage 3 — geo / registration fields validation.
        const { fields: geoFields, error: geoError } = extractEventGeoFields(req.body);
        if (geoError) {
            return res.status(400).json({ message: geoError });
        }

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
            starts,
            place,
            status,
            img: fileName, // Будет null, если файл не загружен
            ...geoFields
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

    async update(req, res) {
        try {
        const { id } = req.params;
        const event = await EventPost.findByPk(id);

        if (!event) {
            return res.status(404).json({ message: 'Событие не найдено' });
        }

        // Stage 3 — validate geo / registration fields against the stored
        // registration_required, then merge the normalized values into the
        // update payload.
        const { fields: geoFields, error: geoError } = extractEventGeoFields(
            req.body,
            event.registration_required
        );
        if (geoError) {
            return res.status(400).json({ message: geoError });
        }
        const data = { ...req.body, ...geoFields };
        // If max_participants was dropped by the validator (registration not
        // required), make sure the raw body value does not slip through.
        if (geoFields.max_participants === undefined) {
            delete data.max_participants;
        }

        // Обновление полей
        await event.update(data);
        return res.json(event);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении события' });
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

            await eventpost.increment('views');
            const imageUrl = `${req.protocol}://${req.get('host')}/static/${eventpost.img}`;
            return res.json({ ...eventpost.get(), img: imageUrl });

        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }
}

module.exports = new EventPostController();