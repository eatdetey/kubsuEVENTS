'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Required for gen_random_uuid() on Postgres.
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // Part A — eventposts: geo + registration metadata
    await queryInterface.addColumn('eventposts', 'latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('eventposts', 'longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('eventposts', 'registration_required', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('eventposts', 'max_participants', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Part B — watchlists: QR ticket + attendance tracking
    // The watchlists PK stays INTEGER (per project-wide decision); ticket_uuid
    // is an additional UUID identifier intended for QR codes. Switching the PK
    // to UUID is deferred to a later refactor that will also update the routes
    // and controllers that currently use the integer id.
    await queryInterface.addColumn('watchlists', 'ticket_uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      unique: true,
    });
    await queryInterface.addColumn('watchlists', 'is_attended', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('watchlists', 'registered_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('watchlists', 'registered_at');
    await queryInterface.removeColumn('watchlists', 'is_attended');
    await queryInterface.removeColumn('watchlists', 'ticket_uuid');

    await queryInterface.removeColumn('eventposts', 'max_participants');
    await queryInterface.removeColumn('eventposts', 'registration_required');
    await queryInterface.removeColumn('eventposts', 'longitude');
    await queryInterface.removeColumn('eventposts', 'latitude');
  },
};
