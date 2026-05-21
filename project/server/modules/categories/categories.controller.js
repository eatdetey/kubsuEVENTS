const categoriesService = require('./categories.service');
const { parseIntId } = require('../../utils/validate');
const ServiceError = require('../../utils/ServiceError');

const SLUG_RE = /^[a-z0-9-]+$/;

// TODO: replace manual validation with a validation library (joi/zod) if one
// is added to the project later.
function validateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ServiceError(400, 'name is required');
  }
}

function validateSlug(slug) {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new ServiceError(
      400,
      'slug must contain only lowercase letters, digits and hyphens'
    );
  }
}

class CategoriesController {
  async list(req, res) {
    const type = req.query.type || 'all'; // reserved for future use
    const result = await categoriesService.listCategories(type);
    return res.status(200).json(result);
  }

  async create(req, res) {
    const { name, slug } = req.body || {};
    validateName(name);
    validateSlug(slug);
    const result = await categoriesService.createCategory(name.trim(), slug);
    return res.status(201).json(result);
  }

  async update(req, res) {
    const id = parseIntId(req.params.id, 'id');
    const { name, slug } = req.body || {};
    if (name === undefined && slug === undefined) {
      throw new ServiceError(400, 'Nothing to update: provide name and/or slug');
    }
    const patch = {};
    if (name !== undefined) {
      validateName(name);
      patch.name = name.trim();
    }
    if (slug !== undefined) {
      validateSlug(slug);
      patch.slug = slug;
    }
    const result = await categoriesService.updateCategory(id, patch);
    return res.status(200).json(result);
  }

  async remove(req, res) {
    const id = parseIntId(req.params.id, 'id');
    const result = await categoriesService.deleteCategory(id);
    return res.status(200).json(result);
  }

  async getMyPreferences(req, res) {
    const result = await categoriesService.getUserPreferences(req.user.id);
    return res.status(200).json(result);
  }

  async updateMyPreferences(req, res) {
    const { categoryIds } = req.body || {};
    if (!Array.isArray(categoryIds)) {
      throw new ServiceError(400, 'categoryIds must be an array');
    }
    // Category ids are integers in this schema; accept numbers or numeric
    // strings and reject anything else before hitting the service.
    const normalized = categoryIds.map((raw) => {
      const n = Number(raw);
      if (!Number.isInteger(n) || n <= 0) {
        throw new ServiceError(400, `Invalid categoryId: ${raw}`);
      }
      return n;
    });
    const result = await categoriesService.replaceUserPreferences(
      req.user.id,
      normalized
    );
    return res.status(200).json(result);
  }
}

module.exports = new CategoriesController();
