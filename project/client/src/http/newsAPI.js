import { $host, $authHost } from './index';

export const createNews = async (news) => {
  const { data } = await $authHost.post('api/newspost', news);
  return data;
};

export const updateNews = async (id, patch) => {
  const { data } = await $authHost.put(`api/newspost/${id}`, patch);
  return data;
};

// Optional `categoryId` narrows the result to that category only.
export const fetchNews = async ({ categoryId } = {}) => {
  const qs = categoryId ? `?category=${categoryId}` : '';
  const { data } = await $host.get(`api/newspost${qs}`);
  return data;
};

export const fetchOneNews = async (id) => {
  const { data } = await $host.get(`api/newspost/${id}`);
  return data;
};

// `likePost` removed: the legacy POST /api/newspost/like/:id endpoint was
// deleted on the server. Use src/http/likesAPI.js instead.
