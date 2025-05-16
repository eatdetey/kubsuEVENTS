const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue:"USER"},
})

// server/models/models.js
const Watchlist = sequelize.define('watchlist', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'userId', // Явно указываем имя поля в БД
      references: {
        model: 'users',
        key: 'id'
      }
    },
    eventpostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'eventpostId', // Явно указываем имя поля в БД
      references: {
        model: 'eventposts',
        key: 'id'
      }
    }
}, {
    // Убираем underscored: true, так как используем camelCase
    tableName: 'watchlists', // Явно указываем имя таблицы
    timestamps: true, // createdAt и updatedAt
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

const EventPost = sequelize.define('eventpost', {
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    title: {type: DataTypes.STRING, unique: true},
    description: {type: DataTypes.TEXT},
    starts: {type: DataTypes.DATE},
    place: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING, defaultValue:"HIDDEN"},
    img: {type: DataTypes.STRING},
})

const NewsPost = sequelize.define('newspost', {
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    title: {type: DataTypes.STRING, unique: true},
    description: {type: DataTypes.TEXT},
    last_updated: {type: DataTypes.DATE},
    likes: {type: DataTypes.INTEGER, defaultValue:0},
})

User.hasOne(Watchlist)
Watchlist.belongsTo(User)

EventPost.hasMany(Watchlist)
Watchlist.belongsTo(EventPost)

Watchlist.hasMany(EventPost)
EventPost.belongsTo(Watchlist)

User.hasMany(EventPost)
EventPost.belongsTo(User)

User.hasMany(NewsPost)
NewsPost.belongsTo(User)

module.exports = {
    User, 
    Watchlist, 
    EventPost, 
    NewsPost
}