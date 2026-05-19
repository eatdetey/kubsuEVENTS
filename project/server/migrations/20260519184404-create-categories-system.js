'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('news_categories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      news_post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'newsposts', key: 'id' },
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addIndex('news_categories', ['news_post_id', 'category_id'], {
      unique: true,
      name: 'news_categories_news_post_category_unique',
    });

    await queryInterface.createTable('event_categories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      event_post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'eventposts', key: 'id' },
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addIndex('event_categories', ['event_post_id', 'category_id'], {
      unique: true,
      name: 'event_categories_event_post_category_unique',
    });

    await queryInterface.createTable('user_preferences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('user_preferences', ['user_id', 'category_id'], {
      unique: true,
      name: 'user_preferences_user_category_unique',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_preferences');
    await queryInterface.dropTable('event_categories');
    await queryInterface.dropTable('news_categories');
    await queryInterface.dropTable('categories');
  },
};
