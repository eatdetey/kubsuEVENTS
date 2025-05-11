import { Component } from "react"
import { ADMIN_ROUTE, EVENT_ROUTE, EVENTPOST_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, WATCHLIST_ROUTE } from "./utils/consts"
import Admin from "./pages/Admin"
import Watchlist from "./pages/Watchlist"
import Events from "./pages/Events"
import EventPost from "./pages/EventPost"
import Auth from "./pages/Auth"

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin
    },
    {
        path: WATCHLIST_ROUTE,
        Component: Watchlist
    }
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
]