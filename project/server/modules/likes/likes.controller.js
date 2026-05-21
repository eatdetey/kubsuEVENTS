const likesService = require('./likes.service');
const { parseIntId } = require('../../utils/validate');

class LikesController {
  async like(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    const result = await likesService.addLike(req.user.id, newsPostId);
    return res.status(201).json(result);
  }

  async unlike(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    const result = await likesService.removeLike(req.user.id, newsPostId);
    return res.status(200).json(result);
  }

  async count(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    // optionalAuth populates req.user only when a valid token was sent.
    const userId = req.user ? req.user.id : null;
    const result = await likesService.getLikesCount(newsPostId, userId);
    return res.status(200).json(result);
  }
}

module.exports = new LikesController();
