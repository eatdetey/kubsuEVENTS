import { $host, $authHost } from './index';

export const fetchComments = async (newsPostId, page = 1, limit = 20) => {
  const { data } = await $host.get(
    `api/news/${newsPostId}/comments?page=${page}&limit=${limit}`
  );
  return data; // { data: [...], pagination }
};

export const createComment = async (newsPostId, content) => {
  const { data } = await $authHost.post(
    `api/news/${newsPostId}/comments`,
    { content }
  );
  return data; // { id, content, createdAt, author }
};

export const deleteComment = async (newsPostId, commentId) => {
  const { data } = await $authHost.delete(
    `api/news/${newsPostId}/comments/${commentId}`
  );
  return data; // { deleted: true }
};
