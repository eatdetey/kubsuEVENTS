import { $authHost, $host } from './index';
import { jwtDecode } from 'jwt-decode';

// `role` is intentionally NOT sent — the server pins new accounts to USER and
// silently drops the field anyway. An optional `username` is forwarded if the
// caller supplies one; otherwise the server derives it from the email.
export const registration = async (email, password, username) => {
  const body = { email, password };
  if (username) body.username = username;
  const { data } = await $host.post('api/user/registration', body);
  localStorage.setItem('token', data.token);
  return jwtDecode(data.token);
};

export const login = async (email, password) => {
  const { data } = await $host.post('api/user/login', { email, password });
  localStorage.setItem('token', data.token);
  return jwtDecode(data.token);
};

export const check = async () => {
  const { data } = await $authHost.get('api/user/auth');
  localStorage.setItem('token', data.token);
  return jwtDecode(data.token);
};

export const fetchProfile = async () => {
  const { data } = await $authHost.get('api/user/profile');
  return data;
};

export const updateProfile = async (updateData) => {
  const { data } = await $authHost.put('api/user/profile', updateData);
  return data;
};

// Legacy `fetchWatchlist` removed long ago: it pointed at a non-existent
// `api/user/watchlist` route. The favorites list now lives in favoritesAPI.js.
