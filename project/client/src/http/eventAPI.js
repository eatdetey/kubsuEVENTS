import { $authHost, $host } from './index';

export const createEvent = async (formData) => {
  const { data } = await $authHost.post('api/eventpost', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateEvent = async (id, data) => {
  const response = await $authHost.put('api/eventpost/' + id, data);
  return response.data;
};

// Optional `categoryId` and `status` map to the supported query params.
export const fetchEvents = async ({ categoryId, status } = {}) => {
  const params = new URLSearchParams();
  if (categoryId) params.set('category', categoryId);
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const { data } = await $host.get(`api/eventpost${qs}`);
  return data;
};

export const fetchOneEvent = async (id) => {
  const { data } = await $host.get('api/eventpost/' + id);
  return data;
};
