'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_devices', {
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
      fcm_token: {
        type: Sequelize.STRING(512),
        allowNull: false,
        unique: true,
      },
      device_type: {
        type: Sequelize.ENUM('android', 'ios', 'web'),
        allowNull: false,
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('user_devices', ['user_id'], {
      name: 'user_devices_user_id_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_devices');
    // ENUM type needs explicit drop in Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_devices_device_type";');
  },
};
