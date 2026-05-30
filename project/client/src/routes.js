import {
  ADMIN_ROUTE,
  ADMIN_CATEGORIES_ROUTE,
  ADMIN_USERS_ROUTE,
  EVENT_ROUTE,
  EVENTPOST_ROUTE,
  LOGIN_ROUTE,
  REGISTRATION_ROUTE,
  WATCHLIST_ROUTE,
  NEWSPOST_ROUTE,
  NEWS_ROUTE,
  USERPROFILE_ROUTE,
  ROLES,
} from './utils/consts';
import Admin from './pages/Admin';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';
import Watchlist from './pages/Watchlist';
import Events from './pages/Events';
import EventPost from './pages/EventPost';
import Auth from './pages/Auth';
import News from './pages/News';
import NewsPost from './pages/NewsPost';
import UserProfile from './pages/UserProfile';

// Routes available only to authenticated users. Add a `roles` array to
// restrict to specific roles (AppRouter wraps the element in <RequireRole>).
export const authRoutes = [
  { path: ADMIN_ROUTE, Component: Admin, roles: [ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN] },
  { path: ADMIN_CATEGORIES_ROUTE, Component: AdminCategories, roles: [ROLES.MOD, ROLES.ADMIN] },
  { path: ADMIN_USERS_ROUTE, Component: AdminUsers, roles: [ROLES.ADMIN] },
  { path: WATCHLIST_ROUTE, Component: Watchlist },
  { path: USERPROFILE_ROUTE, Component: UserProfile },
];

export const publicRoutes = [
  { path: EVENT_ROUTE, Component: Events },
  { path: EVENTPOST_ROUTE + '/:id', Component: EventPost },
  { path: LOGIN_ROUTE, Component: Auth },
  { path: REGISTRATION_ROUTE, Component: Auth },
  { path: NEWS_ROUTE, Component: News },
  { path: NEWSPOST_ROUTE + '/:id', Component: NewsPost },
];
