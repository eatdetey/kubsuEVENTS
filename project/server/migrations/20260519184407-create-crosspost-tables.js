'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('social_accounts', {
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
      platform: {
        type: Sequelize.ENUM('vk', 'telegram'),
        allowNull: false,
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      token_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
    await queryInterface.addIndex('social_accounts', ['user_id', 'platform'], {
      unique: true,
      name: 'social_accounts_user_platform_unique',
    });

    await queryInterface.createTable('vk_groups', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      social_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'social_accounts', key: 'id' },
        onUpdate: 'CASCADE',
      },
      vk_group_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      name: { type: Sequelize.STRING(255), allowNull: true },
      screen_name: { type: Sequelize.STRING(255), allowNull: true },
    });
    await queryInterface.addIndex('vk_groups', ['social_account_id', 'vk_group_id'], {
      unique: true,
      name: 'vk_groups_account_group_unique',
    });

    await queryInterface.createTable('telegram_channels', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      social_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'social_accounts', key: 'id' },
        onUpdate: 'CASCADE',
      },
      channel_id: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      title: { type: Sequelize.STRING(255), allowNull: true },
    });
    await queryInterface.addIndex('telegram_channels', ['social_account_id', 'channel_id'], {
      unique: true,
      name: 'telegram_channels_account_channel_unique',
    });

    await queryInterface.createTable('news_crosspost_targets', {
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
      platform: {
        type: Sequelize.ENUM('vk', 'telegram'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      external_post_id: {
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('event_crosspost_targets', {
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
      platform: {
        type: Sequelize.ENUM('vk', 'telegram'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      external_post_id: {
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('crosspost_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      platform: {
        type: Sequelize.ENUM('vk', 'telegram'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      post_type: {
        type: Sequelize.ENUM('news', 'event'),
        allowNull: false,
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('success', 'failed'),
        allowNull: false,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('crosspost_logs', ['post_type', 'post_id'], {
      name: 'crosspost_logs_post_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('crosspost_logs');
    await queryInterface.dropTable('event_crosspost_targets');
    await queryInterface.dropTable('news_crosspost_targets');
    await queryInterface.dropTable('telegram_channels');
    await queryInterface.dropTable('vk_groups');
    await queryInterface.dropTable('social_accounts');

    // ENUM types created by Sequelize need explicit drop in Postgres.
    const dropEnum = (name) =>
      queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${name}";`);
    await dropEnum('enum_crosspost_logs_status');
    await dropEnum('enum_crosspost_logs_post_type');
    await dropEnum('enum_crosspost_logs_platform');
    await dropEnum('enum_event_crosspost_targets_platform');
    await dropEnum('enum_news_crosspost_targets_platform');
    await dropEnum('enum_social_accounts_platform');
  },
};
