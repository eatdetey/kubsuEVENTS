const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { ROLES } = require('../constants/roles');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ROLES.USER,
        validate: { isIn: [Object.values(ROLES)] },
    },
});

const EventPost = sequelize.define('eventpost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    starts: { type: DataTypes.DATE },
    place: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "Опубликован" },
    img: { type: DataTypes.STRING },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    registration_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    max_participants: { type: DataTypes.INTEGER, allowNull: true },
});

const NewsPost = sequelize.define('newspost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    last_updated: { type: DataTypes.DATE },
});

const Like = sequelize.define('like', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    tableName: 'likes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const Comment = sequelize.define('comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'comments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, {
    tableName: 'categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const NewsCategory = sequelize.define('news_category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    tableName: 'news_categories',
    underscored: true,
    timestamps: false,
});

const EventCategory = sequelize.define('event_category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    tableName: 'event_categories',
    underscored: true,
    timestamps: false,
});

const UserPreference = sequelize.define('user_preference', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    tableName: 'user_preferences',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const UserDevice = sequelize.define('user_device', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fcm_token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    device_type: { type: DataTypes.ENUM('android', 'ios', 'web'), allowNull: false },
    device_id: { type: DataTypes.STRING(255), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
    tableName: 'user_devices',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const SocialAccount = sequelize.define('social_account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    platform: { type: DataTypes.ENUM('vk', 'telegram'), allowNull: false },
    access_token: { type: DataTypes.TEXT, allowNull: true },
    token_expires_at: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'social_accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const VkGroup = sequelize.define('vk_group', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vk_group_id: { type: DataTypes.STRING(64), allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: true },
    screen_name: { type: DataTypes.STRING(255), allowNull: true },
}, {
    tableName: 'vk_groups',
    underscored: true,
    timestamps: false,
});

const TelegramChannel = sequelize.define('telegram_channel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    channel_id: { type: DataTypes.STRING(128), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: true },
}, {
    tableName: 'telegram_channels',
    underscored: true,
    timestamps: false,
});

const NewsCrosspostTarget = sequelize.define('news_crosspost_target', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    platform: { type: DataTypes.ENUM('vk', 'telegram'), allowNull: false },
    target_id: { type: DataTypes.STRING(128), allowNull: false },
    external_post_id: { type: DataTypes.STRING(128), allowNull: true },
}, {
    tableName: 'news_crosspost_targets',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const EventCrosspostTarget = sequelize.define('event_crosspost_target', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    platform: { type: DataTypes.ENUM('vk', 'telegram'), allowNull: false },
    target_id: { type: DataTypes.STRING(128), allowNull: false },
    external_post_id: { type: DataTypes.STRING(128), allowNull: true },
}, {
    tableName: 'event_crosspost_targets',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const CrosspostLog = sequelize.define('crosspost_log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    platform: { type: DataTypes.ENUM('vk', 'telegram'), allowNull: false },
    target_id: { type: DataTypes.STRING(128), allowNull: false },
    post_type: { type: DataTypes.ENUM('news', 'event'), allowNull: false },
    post_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('success', 'failed'), allowNull: false },
    error_message: { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'crosspost_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const Watchlist = sequelize.define('watchlist', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    notified: { type: DataTypes.BOOLEAN, defaultValue: false },
    ticket_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
    },
    is_attended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    registered_at: { type: DataTypes.DATE, allowNull: true },
});

User.belongsToMany(EventPost, { through: Watchlist, as: 'Favorites' });
EventPost.belongsToMany(User, { through: Watchlist });

Watchlist.belongsTo(User);
Watchlist.belongsTo(EventPost);

User.hasMany(Watchlist);
EventPost.hasMany(Watchlist);

NewsPost.belongsTo(User);
User.hasMany(NewsPost);

Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(NewsPost, { foreignKey: 'news_post_id' });
User.hasMany(Like, { foreignKey: 'user_id' });
NewsPost.hasMany(Like, { foreignKey: 'news_post_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(NewsPost, { foreignKey: 'news_post_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
NewsPost.hasMany(Comment, { foreignKey: 'news_post_id' });

NewsPost.belongsToMany(Category, {
    through: NewsCategory,
    foreignKey: 'news_post_id',
    otherKey: 'category_id',
});
Category.belongsToMany(NewsPost, {
    through: NewsCategory,
    foreignKey: 'category_id',
    otherKey: 'news_post_id',
});

EventPost.belongsToMany(Category, {
    through: EventCategory,
    foreignKey: 'event_post_id',
    otherKey: 'category_id',
});
Category.belongsToMany(EventPost, {
    through: EventCategory,
    foreignKey: 'category_id',
    otherKey: 'event_post_id',
});

User.belongsToMany(Category, {
    through: UserPreference,
    foreignKey: 'user_id',
    otherKey: 'category_id',
    as: 'PreferredCategories',
});
Category.belongsToMany(User, {
    through: UserPreference,
    foreignKey: 'category_id',
    otherKey: 'user_id',
});

UserDevice.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserDevice, { foreignKey: 'user_id' });

SocialAccount.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SocialAccount, { foreignKey: 'user_id' });

VkGroup.belongsTo(SocialAccount, { foreignKey: 'social_account_id' });
SocialAccount.hasMany(VkGroup, { foreignKey: 'social_account_id' });

TelegramChannel.belongsTo(SocialAccount, { foreignKey: 'social_account_id' });
SocialAccount.hasMany(TelegramChannel, { foreignKey: 'social_account_id' });

NewsCrosspostTarget.belongsTo(NewsPost, { foreignKey: 'news_post_id' });
NewsPost.hasMany(NewsCrosspostTarget, { foreignKey: 'news_post_id' });

EventCrosspostTarget.belongsTo(EventPost, { foreignKey: 'event_post_id' });
EventPost.hasMany(EventCrosspostTarget, { foreignKey: 'event_post_id' });

module.exports = {
    User,
    Watchlist,
    EventPost,
    NewsPost,
    Like,
    Comment,
    Category,
    NewsCategory,
    EventCategory,
    UserPreference,
    UserDevice,
    SocialAccount,
    VkGroup,
    TelegramChannel,
    NewsCrosspostTarget,
    EventCrosspostTarget,
    CrosspostLog
};
