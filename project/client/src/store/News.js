import { makeAutoObservable } from "mobx";

export default class News {
  constructor() {
    this._news = [];
    makeAutoObservable(this);
  }

  setNews(news) {
    this._news = news;
  }

  get newsItems() {
    return this._news;
  }
}