import { $host, $authHost } from './index';

export const fetchCategories = async () => {
  const { data } = await $host.get('api/categories');
  return data; // [{ id, name, slug }]
};

export const createCategory = async ({ name, slug }) => {
  const { data } = await $authHost.post('api/categories', { name, slug });
  return data;
};

export const updateCategory = async (id, patch) => {
  const { data } = await $authHost.put(`api/categories/${id}`, patch);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await $authHost.delete(`api/categories/${id}`);
  return data;
};

// Current user's category preferences (used by the profile screen in Block 6).
export const fetchMyPreferences = async () => {
  const { data } = await $authHost.get('api/users/me/preferences');
  return data; // [{ id, name, slug }]
};

export const updateMyPreferences = async (categoryIds) => {
  const { data } = await $authHost.put('api/users/me/preferences', { categoryIds });
  return data;
};
