import { $host, $authHost } from "./index";

export const createNews = async (news) => {
    const { data } = await $authHost.post('api/newspost', news);
    return data;
}

export const fetchNews = async () => {
  const { data } = await $host.get('api/newspost');
  return data;
}

export const fetchOneNews = async (id) => {
  const { data } = await $host.get(`api/newspost/${id}`);
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    likes: data.likes,
    createdAt: data.last_updated
  };
};

export const likePost = async (id) => {
    const { data } = await $authHost.post(`api/newspost/like/${id}`);
    return data;
};