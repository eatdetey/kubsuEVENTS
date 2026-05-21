const commentsService = require('./comments.service');
const { parseIntId, parsePagination } = require('../../utils/validate');
const ServiceError = require('../../utils/ServiceError');

const CONTENT_MIN = 1;
const CONTENT_MAX = 2000;

class CommentsController {
  async list(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    const { page, limit, offset } = parsePagination(req.query);
    const result = await commentsService.listComments(newsPostId, {
      page,
      limit,
      offset,
    });
    return res.status(200).json(result);
  }

  async create(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    // TODO: replace manual checks with a validation library (joi/zod) if one
    // is added to the project later.
    const { content } = req.body || {};
    if (typeof content !== 'string' || content.trim().length < CONTENT_MIN) {
      throw new ServiceError(400, 'content is required');
    }
    if (content.length > CONTENT_MAX) {
      throw new ServiceError(400, `content must be at most ${CONTENT_MAX} characters`);
    }
    const result = await commentsService.createComment(
      newsPostId,
      req.user.id,
      content.trim()
    );
    return res.status(201).json(result);
  }

  async remove(req, res) {
    const newsPostId = parseIntId(req.params.newsPostId, 'newsPostId');
    const commentId = parseIntId(req.params.commentId, 'commentId');
    const result = await commentsService.deleteComment(
      newsPostId,
      commentId,
      req.user
    );
    return res.status(200).json(result);
  }
}

module.exports = new CommentsController();
