import { makeAutoObservable } from 'mobx';

export default class Events {
    constructor() {
        this._eventPost = []
        makeAutoObservable(this)
    }

    setEventPost(eventPost) {
        this._eventPost = eventPost
    }

    get eventPost() {
        return this._eventPost
    }
}