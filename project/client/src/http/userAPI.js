import {$authHost, $host} from "./index";
import { jwtDecode } from "jwt-decode";

export const registration = async (email, password) => {
    const {data} = await $host.post('api/user/registration', {email, password, role: 'USER'})
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token)
}

export const login = async (email, password) => {
    const {data} = await $host.post('api/user/login', {email, password})
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token)
}

export const check = async () => {
    const {data} = await $authHost.get('api/user/auth')
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token)
}

export const fetchProfile = async () => {
  const { data } = await $authHost.get('api/user/profile');
  return data;
};

export const updateProfile = async (updateData) => {
  const { data } = await $authHost.put('api/user/profile', updateData);
  return data;
};

export const fetchWatchlist = async () => {
  try {
    const { data } = await $authHost.get('api/user/watchlist');
    return Array.isArray(data) ? data.filter(item => item.event_post) : [];
  } catch (e) {
    console.error('Fetch watchlist error:', e);
    throw e;
  }
};