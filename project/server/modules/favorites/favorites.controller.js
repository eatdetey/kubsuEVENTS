const favoritesService = require('./favorites.service');
const { parseIntId } = require('../../utils/validate');

class FavoritesController {
  async list(req, res) {
    const result = await favoritesService.listMyFavorites(req.user.id);
    return res.status(200).json(result);
  }

  async add(req, res) {
    const eventPostId = parseIntId(req.params.eventPostId, 'eventPostId');
    const result = await favoritesService.addFavorite(req.user.id, eventPostId);
    return res.status(201).json(result);
  }

  async remove(req, res) {
    const eventPostId = parseIntId(req.params.eventPostId, 'eventPostId');
    const result = await favoritesService.removeFavorite(req.user.id, eventPostId);
    return res.status(200).json(result);
  }
}

module.exports = new FavoritesController();
