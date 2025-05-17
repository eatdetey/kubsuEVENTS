const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const EventPost = sequelize.define('eventpost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    starts: { type: DataTypes.DATE },
    place: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "Опубликован" },
    img: { type: DataTypes.STRING },
});

const NewsPost = sequelize.define('newspost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    last_updated: { type: DataTypes.DATE },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Watchlist = sequelize.define('watchlist', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    notified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

User.belongsToMany(EventPost, { through: Watchlist, as: 'Favorites' });
EventPost.belongsToMany(User, { through: Watchlist });

Watchlist.belongsTo(User);
Watchlist.belongsTo(EventPost);

User.hasMany(Watchlist);
EventPost.hasMany(Watchlist);

NewsPost.belongsTo(User);
User.hasMany(NewsPost);

module.exports = {
    User,
    Watchlist,
    EventPost,
    NewsPost
};
