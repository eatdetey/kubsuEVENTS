const { Favorite, EventPost } = require('../../models/models');
const ServiceError = require('../../utils/ServiceError');

async function assertEventExists(eventPostId) {
  const event = await EventPost.findByPk(eventPostId);
  if (!event) throw new ServiceError(404, 'Event not found');
  return event;
}

// Returns the current user's favorite event posts ordered by most recent
// favoriting first. Each entry carries the full EventPost payload.
async function listMyFavorites(userId) {
  const rows = await Favorite.findAll({
    where: { userId },
    include: [{ model: EventPost }],
    order: [['createdAt', 'DESC']],
  });
  return rows
    .filter((r) => r.eventpost) // skip orphan rows (event since deleted)
    .map((r) => ({
      ...r.eventpost.get({ plain: true }),
      favoritedAt: r.createdAt,
    }));
}

async function addFavorite(userId, eventPostId) {
  await assertEventExists(eventPostId);
  try {
    await Favorite.create({ userId, eventpostId: eventPostId });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw new ServiceError(409, 'Already favorited');
    }
    throw e;
  }
  return { favorited: true };
}

async function removeFavorite(userId, eventPostId) {
  const deleted = await Favorite.destroy({
    where: { userId, eventpostId: eventPostId },
  });
  if (!deleted) {
    throw new ServiceError(404, 'Favorite not found');
  }
  return { favorited: false };
}

module.exports = { listMyFavorites, addFavorite, removeFavorite };
