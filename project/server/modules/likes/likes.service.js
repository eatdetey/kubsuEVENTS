const { Like, NewsPost } = require('../../models/models');
const ServiceError = require('../../utils/ServiceError');

async function assertNewsPostExists(newsPostId) {
  const news = await NewsPost.findByPk(newsPostId);
  if (!news) {
    throw new ServiceError(404, 'News post not found');
  }
}

async function countLikes(newsPostId) {
  return Like.count({ where: { news_post_id: newsPostId } });
}

// Creates a like. Relies on the unique (user_id, news_post_id) index to reject
// duplicates with a 409 instead of silently inserting a second row.
async function addLike(userId, newsPostId) {
  await assertNewsPostExists(newsPostId);
  try {
    await Like.create({ user_id: userId, news_post_id: newsPostId });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw new ServiceError(409, 'Already liked');
    }
    throw e;
  }
  const likesCount = await countLikes(newsPostId);
  return { liked: true, likesCount };
}

async function removeLike(userId, newsPostId) {
  await assertNewsPostExists(newsPostId);
  const deleted = await Like.destroy({
    where: { user_id: userId, news_post_id: newsPostId },
  });
  if (!deleted) {
    throw new ServiceError(404, 'Like not found');
  }
  const likesCount = await countLikes(newsPostId);
  return { liked: false, likesCount };
}

// Single service call doing both queries: total count, and (for an
// authenticated caller) whether they personally liked the post.
async function getLikesCount(newsPostId, userId) {
  await assertNewsPostExists(newsPostId);
  const [likesCount, ownLike] = await Promise.all([
    countLikes(newsPostId),
    userId
      ? Like.findOne({ where: { user_id: userId, news_post_id: newsPostId } })
      : Promise.resolve(null),
  ]);
  return {
    likesCount,
    liked: userId ? Boolean(ownLike) : null,
  };
}

module.exports = { addLike, removeLike, getLikesCount };
