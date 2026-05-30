import { $authHost } from './index';

export const fetchAllUsers = async () => {
  const { data } = await $authHost.get('api/users');
  return data; // [{ id, email, username, role, createdAt }]
};

export const changeUserRole = async (userId, role) => {
  const { data } = await $authHost.patch(`api/users/${userId}/role`, { role });
  return data; // { id, email, username, role }
};
