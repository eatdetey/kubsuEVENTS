const { NewsPost, User, Category, NewsCategory } = require('../models/models')
const ApiError = require('../error/ApiError')
const { ROLES } = require('../constants/roles')

// Coerce a body.categoryIds value into an array of positive integer ids, or
// null if the field was not supplied (so update can distinguish "leave the
// associations alone" from "set to empty").
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

class NewsPostController {
    async create(req, res, next) {
        try {
            const { title, description } = req.body;
            const categoryIds = parseCategoryIds(req.body.categoryIds);

            const news = await NewsPost.create({
                title,
                description,
                userId: req.user.id,
            });

            if (categoryIds && categoryIds.length > 0) {
                await news.setCategories(categoryIds);
            }

            const full = await NewsPost.findByPk(news.id, {
                include: [{ model: User, attributes: ['id', 'email'] }, CATEGORY_INCLUDE],
            });
            return res.json(full);
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const categoryFilter = req.query.category
                ? parseInt(req.query.category, 10)
                : null;

            const findOptions = {
                include: [
                    { model: User, attributes: ['id', 'email'] },
                    CATEGORY_INCLUDE,
                ],
                order: [['createdAt', 'DESC']],
            };

            if (categoryFilter && Number.isInteger(categoryFilter) && categoryFilter > 0) {
                // Resolve post ids that belong to the category first to avoid
                // duplicate rows from the join.
                const links = await NewsCategory.findAll({
                    where: { category_id: categoryFilter },
                    attributes: ['news_post_id'],
                });
                const ids = links.map(l => l.news_post_id);
                if (ids.length === 0) return res.json([]);
                findOptions.where = { id: ids };
            }

            const news = await NewsPost.findAll(findOptions);
            return res.json(news);
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const news = await NewsPost.findByPk(id, {
                include: [
                    { model: User, attributes: ['id', 'email'] },
                    CATEGORY_INCLUDE,
                ],
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

            if (req.user.role === ROLES.EDITOR && news.userId !== req.user.id) {
                return next(ApiError.forbidden('Можно редактировать только свои новости'))
            }

            const categoryIds = parseCategoryIds(req.body.categoryIds);
            // Avoid blindly forwarding categoryIds to the column update.
            const { categoryIds: _omit, ...patch } = req.body;

            await NewsPost.update(patch, { where: { id } });
            if (categoryIds !== null) {
                await news.setCategories(categoryIds);
            }

            const updatedPost = await NewsPost.findByPk(id, {
                include: [
                    { model: User, attributes: ['id', 'email'] },
                    CATEGORY_INCLUDE,
                ],
            });
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

            if (req.user.role === ROLES.EDITOR && news.userId !== req.user.id) {
                return next(ApiError.forbidden('Можно удалять только свои новости'))
            }

            await NewsPost.destroy({ where: { id } });
            return res.json({ success: true });
        } catch (e) {
            next(ApiError.internal(e.message))
        }
    }

    // Legacy `like` action removed: the integer counter was dropped in Stage 1
    // and replaced by the dedicated likes module (modules/likes/*).
}

module.exports = new NewsPostController()
