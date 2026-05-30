// Route paths
export const ADMIN_ROUTE = '/admin';
export const ADMIN_CATEGORIES_ROUTE = '/admin/categories';
export const ADMIN_USERS_ROUTE = '/admin/users';
export const LOGIN_ROUTE = '/login';
export const REGISTRATION_ROUTE = '/registration';
export const EVENT_ROUTE = '/';
export const WATCHLIST_ROUTE = '/watchlist';
export const EVENTPOST_ROUTE = '/event';
export const NEWS_ROUTE = '/news';
export const NEWSPOST_ROUTE = '/newspost';
export const USERPROFILE_ROUTE = '/profile';

// Role catalogue — single source of truth on the client.
// Keep in sync with server/constants/roles.js.
export const ROLES = Object.freeze({
  USER: 'USER',
  SECURITY: 'SECURITY',
  EDITOR: 'EDITOR',
  MOD: 'MOD',
  ADMIN: 'ADMIN',
});

export const ROLE_HIERARCHY = Object.freeze({
  USER: 0,
  SECURITY: 1,
  EDITOR: 2,
  MOD: 3,
  ADMIN: 4,
});
