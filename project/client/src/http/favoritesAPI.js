import { $authHost } from './index';

// New /api/favorites module — replaces the legacy /api/watchlist endpoints
// after the favorites / registrations split.

export const fetchFavorites = async () => {
  const { data } = await $authHost.get('api/favorites');
  return data; // [{ ...EventPost, favoritedAt }]
};

export const addFavorite = async (eventPostId) => {
  const { data } = await $authHost.post(`api/favorites/${eventPostId}`);
  return data; // { favorited: true }
};

export const removeFavorite = async (eventPostId) => {
  const { data } = await $authHost.delete(`api/favorites/${eventPostId}`);
  return data; // { favorited: false }
};
