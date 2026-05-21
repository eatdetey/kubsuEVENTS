const { Op } = require('sequelize');
const {
  Category,
  NewsCategory,
  EventCategory,
  UserPreference,
} = require('../../models/models');
const ServiceError = require('../../utils/ServiceError');

function toCategoryDTO(category) {
  return { id: category.id, name: category.name, slug: category.slug };
}

// --- Categories ------------------------------------------------------------

// `type` ('news' | 'event' | 'all') is reserved for future per-type
// categories; for now all categories are shared and it is ignored.
async function listCategories(/* type */) {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return categories.map(toCategoryDTO);
}

async function createCategory(name, slug) {
  const existing = await Category.findOne({
    where: { [Op.or]: [{ name }, { slug }] },
  });
  if (existing) {
    throw new ServiceError(409, 'Category with this name or slug already exists');
  }
  const category = await Category.create({ name, slug });
  return toCategoryDTO(category);
}

async function updateCategory(id, fields) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw new ServiceError(404, 'Category not found');
  }
  const patch = {};
  if (fields.name !== undefined) patch.name = fields.name;
  if (fields.slug !== undefined) patch.slug = fields.slug;

  if (patch.name !== undefined || patch.slug !== undefined) {
    const clashConditions = [];
    if (patch.name !== undefined) clashConditions.push({ name: patch.name });
    if (patch.slug !== undefined) clashConditions.push({ slug: patch.slug });
    const clash = await Category.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: clashConditions,
      },
    });
    if (clash) {
      throw new ServiceError(409, 'Category with this name or slug already exists');
    }
  }

  await category.update(patch);
  return toCategoryDTO(category);
}

async function deleteCategory(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw new ServiceError(404, 'Category not found');
  }
  // Explicit check required by the spec: news_categories / event_categories.
  const [newsLinks, eventLinks] = await Promise.all([
    NewsCategory.count({ where: { category_id: id } }),
    EventCategory.count({ where: { category_id: id } }),
  ]);
  if (newsLinks > 0 || eventLinks > 0) {
    throw new ServiceError(409, 'Category is in use, cannot delete');
  }
  // Safety net: categories are also referenced by user_preferences (not part
  // of the spec's explicit check). Catch the FK violation so such a category
  // still produces a clean 409 instead of an unhandled 500.
  try {
    await category.destroy();
  } catch (e) {
    if (e.name === 'SequelizeForeignKeyConstraintError') {
      throw new ServiceError(409, 'Category is in use, cannot delete');
    }
    throw e;
  }
  return { deleted: true };
}

// --- User preferences ------------------------------------------------------

// UserPreference is a plain join table with no direct belongsTo(Category)
// association, so resolve the categories in a second explicit query.
async function getUserPreferences(userId) {
  const prefs = await UserPreference.findAll({
    where: { user_id: userId },
    attributes: ['category_id'],
  });
  const ids = prefs.map((p) => p.category_id);
  if (ids.length === 0) return [];
  const categories = await Category.findAll({
    where: { id: { [Op.in]: ids } },
    order: [['name', 'ASC']],
  });
  return categories.map(toCategoryDTO);
}

// Replace-all strategy: validate every id exists, then wipe and re-insert.
async function replaceUserPreferences(userId, categoryIds) {
  const uniqueIds = [...new Set(categoryIds)];

  if (uniqueIds.length > 0) {
    const found = await Category.findAll({
      where: { id: { [Op.in]: uniqueIds } },
      attributes: ['id'],
    });
    const foundIds = new Set(found.map((c) => c.id));
    const invalid = uniqueIds.filter((id) => !foundIds.has(id));
    if (invalid.length > 0) {
      throw new ServiceError(
        400,
        `Unknown categoryIds: ${invalid.join(', ')}`
      );
    }
  }

  await UserPreference.destroy({ where: { user_id: userId } });
  if (uniqueIds.length > 0) {
    await UserPreference.bulkCreate(
      uniqueIds.map((id) => ({ user_id: userId, category_id: id }))
    );
  }
  return getUserPreferences(userId);
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserPreferences,
  replaceUserPreferences,
};
