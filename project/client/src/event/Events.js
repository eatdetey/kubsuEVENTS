import { makeAutoObservable } from 'mobx';

export default class Events {
    constructor() {
        this._eventPost = [
            {
                "id": 7,
                "title": "Zaddy1",
                "description": "Ооооооооооооо зеленоглазое такси ооооооооо не тормози не тормози",
                "starts": null,
                "place": "КубГУ",
                "status": "HIDDEN",
                "img": "26b6bd64-2c84-49c1-a47f-83d7ee65cd7c.jpg",
                "createdAt": "2025-05-01T19:44:44.595Z",
                "updatedAt": "2025-05-01T19:44:44.595Z",
                "watchlistId": null,
                "userId": 2
            },
            {
                "id": 8,
                "title": "Zaddy12",
                "description": "Ооооооооооооо зеленоглазое такси ооооооооо не тормози не тормози",
                "starts": null,
                "place": "КубГУ",
                "status": "Опубликован",
                "img": "ad2da9b5-9654-40a7-93ab-ae2f3e60b092.jpg",
                "createdAt": "2025-05-01T21:07:58.497Z",
                "updatedAt": "2025-05-01T21:07:58.497Z",
                "watchlistId": null,
                "userId": 2
            },
            {
                "id": 1,
                "title": "Конференция",
                "description": null,
                "starts": null,
                "place": null,
                "status": "HIDDEN",
                "img": null,
                "createdAt": "2025-05-01T18:42:24.196Z",
                "updatedAt": "2025-05-01T18:42:24.196Z",
                "watchlistId": null,
                "userId": null
            },
            {
                "id": 2,
                "title": "Семинар",
                "description": null,
                "starts": null,
                "place": null,
                "status": "HIDDEN",
                "img": null,
                "createdAt": "2025-05-01T18:47:01.080Z",
                "updatedAt": "2025-05-01T18:47:01.080Z",
                "watchlistId": null,
                "userId": null
            },
            {
                "id": 4,
                "title": "Прикол",
                "description": "Ооооооооооооо зеленоглазое такси ооооооооо не тормози не тормози",
                "starts": null,
                "place": "КубГУ",
                "status": "Опубликован",
                "img": "2d89ba23-6241-42b0-9401-797f646176fc.jpg",
                "createdAt": "2025-05-01T19:30:19.672Z",
                "updatedAt": "2025-05-01T19:30:19.672Z",
                "watchlistId": null,
                "userId": 2
            },
            {
                "id": 5,
                "title": "Zaddy",
                "description": "Ооооооооооооо зеленоглазое такси ооооооооо не тормози не тормози",
                "starts": null,
                "place": "КубГУ",
                "status": "Опубликован",
                "img": "b30e3beb-d018-49a1-a807-637dd588d8be.jpg",
                "createdAt": "2025-05-01T19:33:51.115Z",
                "updatedAt": "2025-05-01T19:33:51.115Z",
                "watchlistId": null,
                "userId": 2
            },
        ]
        makeAutoObservable(this)
    }

    setEventPost(eventPost) {
        this._eventPost = eventPost
    }

    get eventPost() {
        return this._eventPost
    }
}