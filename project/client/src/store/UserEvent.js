import { makeAutoObservable } from 'mobx';

export default class UserEvent {
    constructor() {
        this._isAuth = false
        this._user = {}
        makeAutoObservable(this)
    }

    setIsAuth(bool){
        this._isAuth = bool
    }
    setUser(user) {
        this._user = user
    }

    get role() {
    return this._user.role
    }

    get isAuth() {
        return this._isAuth
    }
    get user() {
        return this._user
    }
}