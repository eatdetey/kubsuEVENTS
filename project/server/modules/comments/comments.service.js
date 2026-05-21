const { Comment, NewsPost, User } = require('../../models/models');
const { ROLES } = require('../../constants/roles');
const ServiceError = require('../../utils/ServiceError');

// Only public, non-sensitive author fields are ever selected — never
// password / email / role.
const AUTHOR_ATTRS = ['id', 'username'];

function toAuthor(user) {
  return user ? { id: user.id, username: user.username } : null;
}

function toCommentDTO(comment) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    author: toAuthor(comment.user),
  };
}

async function assertNewsPostExists(newsPostId) {
  const news = await NewsPost.findByPk(newsPostId);
  if (!news) {
    throw new ServiceError(404, 'News post not found');
  }
}

// Paginated list, newest first. Returns DTOs + pagination meta.
async function listComments(newsPostId, { page, limit, offset }) {
  await assertNewsPostExists(newsPostId);
  const { count, rows } = await Comment.findAndCountAll({
    where: { news_post_id: newsPostId },
    include: [{ model: User, attributes: AUTHOR_ATTRS }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return {
    data: rows.map(toCommentDTO),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 0,
    },
  };
}

async function createComment(newsPostId, userId, content) {
  await assertNewsPostExists(newsPostId);
  const created = await Comment.create({
    news_post_id: newsPostId,
    user_id: userId,
    content,
  });
  // Re-fetch with the author join so the response carries author info.
  const comment = await Comment.findByPk(created.id, {
    include: [{ model: User, attributes: AUTHOR_ATTRS }],
  });
  return toCommentDTO(comment);
}

// Deletes a comment. Allowed for the comment's own author, or for MOD / ADMIN.
async function deleteComment(newsPostId, commentId, currentUser) {
  const comment = await Comment.findByPk(commentId);
  if (!comment || comment.news_post_id !== newsPostId) {
    throw new ServiceError(404, 'Comment not found');
  }
  const isOwner = comment.user_id === currentUser.id;
  const isModerator =
    currentUser.role === ROLES.MOD || currentUser.role === ROLES.ADMIN;
  if (!isOwner && !isModerator) {
    throw new ServiceError(403, 'Not allowed to delete this comment');
  }
  await comment.destroy();
  return { deleted: true };
}

module.exports = { listComments, createComment, deleteComment };
