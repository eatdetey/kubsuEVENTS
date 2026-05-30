const {
    EventPost, Category, EventCategory,
    Favorite, EventRegistration,
} = require('../models/models');
const { fn, col } = require('sequelize');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { extractEventGeoFields } = require('../utils/eventGeoFields');

// Coerce a body.categoryIds value into an array of positive integer ids, or
// null if the field was not supplied. Handles JSON-string (multipart) and
// real arrays alike.
function parseCategoryIds(raw) {
    if (raw === undefined || raw === null) return null;
    let arr = raw;
    if (typeof raw === 'string') {
        try { arr = JSON.parse(raw); } catch (_) { arr = raw.split(','); }
    }
    if (!Array.isArray(arr)) return null;
    const out = [];
    for (const item of arr) {
        const n = Number(item);
        if (Number.isInteger(n) && n > 0) out.push(n);
    }
    return [...new Set(out)];
}

const CATEGORY_INCLUDE = {
    model: Category,
    attributes: ['id', 'name', 'slug'],
    through: { attributes: [] },
};

function absoluteImage(req, file) {
    if (!file) return null;
    return `${req.protocol}://${req.get('host')}/static/${file}`;
}

class EventPostController {
    async create(req, res, next) {
    try {
        const { title, userId, description, starts, place, status } = req.body;

        // Stage 3 — geo / registration fields validation.
        const { fields: geoFields, error: geoError } = extractEventGeoFields(req.body);
        if (geoError) {
            return res.status(400).json({ message: geoError });
        }

        const categoryIds = parseCategoryIds(req.body.categoryIds);

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

        if (categoryIds && categoryIds.length > 0) {
            await eventpost.setCategories(categoryIds);
        }

        const full = await EventPost.findByPk(eventpost.id, {
            include: [CATEGORY_INCLUDE],
        });

        return res.json({
            ...full.get({ plain: true }),
            img: absoluteImage(req, fileName),
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
        const categoryIds = parseCategoryIds(req.body.categoryIds);
        // Strip categoryIds so it doesn't reach `event.update()` as a column.
        const { categoryIds: _omit, ...rawBody } = req.body;
        const data = { ...rawBody, ...geoFields };
        if (geoFields.max_participants === undefined) {
            delete data.max_participants;
        }

        await event.update(data);
        if (categoryIds !== null) {
            await event.setCategories(categoryIds);
        }

        const full = await EventPost.findByPk(id, { include: [CATEGORY_INCLUDE] });
        return res.json({
            ...full.get({ plain: true }),
            img: absoluteImage(req, full.img),
        });
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении события' });
        }
    }

    async getAll(req, res, next) {
    try {
        const { status } = req.query;
        const categoryFilter = req.query.category
            ? parseInt(req.query.category, 10)
            : null;

        const findOptions = { include: [CATEGORY_INCLUDE] };
        const where = {};
        if (status) where.status = status;

        if (categoryFilter && Number.isInteger(categoryFilter) && categoryFilter > 0) {
            const links = await EventCategory.findAll({
                where: { category_id: categoryFilter },
                attributes: ['event_post_id'],
            });
            const ids = links.map(l => l.event_post_id);
            if (ids.length === 0) return res.json([]);
            where.id = ids;
        }
        if (Object.keys(where).length > 0) findOptions.where = where;

        const eventposts = await EventPost.findAll(findOptions);

        // One aggregate query for registered counts (used by the "Мест нет"
        // badge) — driven by event_registrations now that favorites live in
        // a separate table.
        const counts = await EventRegistration.findAll({
            attributes: ['event_post_id', [fn('COUNT', col('id')), 'cnt']],
            group: ['event_post_id'],
            raw: true,
        });
        const countMap = new Map(counts.map(c => [c.event_post_id, parseInt(c.cnt, 10)]));

        // For an authenticated caller, build two id-sets so the UI can
        // render the heart filled / "Зарегистрирован" badge without a
        // second round-trip. optionalAuth populated req.user when a valid
        // token was sent; anonymous callers get null fields.
        const userId = req.user?.id ?? null;
        let favoritedSet = null;
        let registeredSet = null;
        if (userId) {
            const [favs, regs] = await Promise.all([
                Favorite.findAll({
                    where: { userId },
                    attributes: ['eventpostId'],
                    raw: true,
                }),
                EventRegistration.findAll({
                    where: { user_id: userId },
                    attributes: ['event_post_id'],
                    raw: true,
                }),
            ]);
            favoritedSet = new Set(favs.map(f => f.eventpostId));
            registeredSet = new Set(regs.map(r => r.event_post_id));
        }

        const postsWithUrls = eventposts.map(post => {
            const plain = post.get({ plain: true });
            return {
                ...plain,
                registeredCount: countMap.get(plain.id) ?? 0,
                isFavorited: userId ? favoritedSet.has(plain.id) : null,
                isRegistered: userId ? registeredSet.has(plain.id) : null,
                img: absoluteImage(req, plain.img),
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
            const eventpost = await EventPost.findByPk(id, {
                include: [CATEGORY_INCLUDE],
            });

            if (!eventpost) {
                return next(ApiError.notFound('Запись не найдена'));
            }

            // View counter intentionally not incremented anymore (Task 3 of
            // this stage). The `views` column stays in the DB / model so
            // existing rows aren't lost.

            // Public counter of registrations on the event. Same exposure
            // as showing the number of attendees on a public page — no PII.
            const registeredCount = await EventRegistration.count({
                where: { event_post_id: eventpost.id },
            });

            const userId = req.user?.id ?? null;
            let isFavorited = null;
            let isRegistered = null;
            if (userId) {
                const [fav, reg] = await Promise.all([
                    Favorite.findOne({
                        where: { userId, eventpostId: eventpost.id },
                        attributes: ['id'],
                    }),
                    EventRegistration.findOne({
                        where: { user_id: userId, event_post_id: eventpost.id },
                        attributes: ['id'],
                    }),
                ]);
                isFavorited = Boolean(fav);
                isRegistered = Boolean(reg);
            }

            return res.json({
                ...eventpost.get({ plain: true }),
                registeredCount,
                isFavorited,
                isRegistered,
                img: absoluteImage(req, eventpost.img),
            });

        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }
}

module.exports = new EventPostController();
