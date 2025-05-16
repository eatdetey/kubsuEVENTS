import { Component } from "react"
import { ADMIN_ROUTE, EVENT_ROUTE, EVENTPOST_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, WATCHLIST_ROUTE, NEWSPOST_ROUTE, NEWS_ROUTE, USERPROFILE_ROUTE } from "./utils/consts"
import Admin from "./pages/Admin"
import Watchlist from "./pages/Watchlist"
import Events from "./pages/Events"
import EventPost from "./pages/EventPost"
import Auth from "./pages/Auth"
import News from "./pages/News"
import NewsPost from "./pages/NewsPost"
import UserProfile from "./pages/UserProfile"

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin
    },
    {
        path: WATCHLIST_ROUTE,
        Component: Watchlist
    },
    {
        path: USERPROFILE_ROUTE,
        Component: UserProfile
    },
]

export const publicRoutes = [
    {
        path: EVENT_ROUTE,
        Component: Events
    },
    {
        path: EVENTPOST_ROUTE + '/:id',
        Component: EventPost
    },
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth
    },
    {
        path: NEWS_ROUTE,
        Component: News
    },
    {
        path: NEWSPOST_ROUTE + '/:id',
        Component: NewsPost
    },
]