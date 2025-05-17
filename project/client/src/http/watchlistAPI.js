import { $authHost } from './index';

export const fetchWatchlist = async () => {
  const { data } = await $authHost.get('api/watchlist');
  return data;
};

export const addToWatchlist = async (eventPostId) => {
  const { data } = await $authHost.post('api/watchlist', { eventPostId });
  return data;
};

export const removeFromWatchlist = async (eventId) => {
  const { data } = await $authHost.delete(`api/watchlist/${eventId}`);
  return data;
};
