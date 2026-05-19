'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('likes', {
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
      news_post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'newsposts', key: 'id' },
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('likes', ['user_id', 'news_post_id'], {
      unique: true,
      name: 'likes_user_post_unique',
    });

    // Data migration skipped: the existing newsposts.likes column is a plain
    // counter with no per-user information, and there is no system user to
    // attribute legacy likes to. Backfilling N rows from a single fake user
    // would also violate the unique (user_id, news_post_id) constraint above.

    await queryInterface.removeColumn('newsposts', 'likes');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('newsposts', 'likes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.dropTable('likes');
  },
};
