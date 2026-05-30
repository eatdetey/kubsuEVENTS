import { $host, $authHost } from './index';

export const likeNewsPost = async (newsPostId) => {
  const { data } = await $authHost.post(`api/news/${newsPostId}/like`);
  return data; // { liked: true, likesCount }
};

export const unlikeNewsPost = async (newsPostId) => {
  const { data } = await $authHost.delete(`api/news/${newsPostId}/like`);
  return data; // { liked: false, likesCount }
};

// Public endpoint; if a token is present in localStorage the optional-auth
// middleware will populate `liked` for the current user, otherwise it's null.
export const fetchLikesCount = async (newsPostId) => {
  const instance = localStorage.getItem('token') ? $authHost : $host;
  const { data } = await instance.get(`api/news/${newsPostId}/likes/count`);
  return data; // { likesCount, liked: boolean|null }
};
