'use strict';

// Splits the legacy `watchlists` table into two: pure favorites stay in
// `watchlists`; registration metadata (ticket_uuid, is_attended,
// registered_at) moves to a new `event_registrations` table. After this
// migration a user can independently favorite an event AND register for it.
//
// Distinguishing rule for the data move:
//   registered_at IS NOT NULL  →  registration row (move out)
//   registered_at IS NULL      →  favorite row (stays put)
//
// Naming choices:
//   PKs/FKs stay INTEGER — the whole project uses integer ids by decision
//   made in Stage 1. Only ticket_uuid keeps the UUID type.
//   Column casing on the new table follows the underscored convention used
//   by every Stage-1+ new table (likes, comments, user_devices, ...).

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // pgcrypto is already installed from Stage 1 (extend-eventposts-watchlists);
    // re-create defensively so this migration can run on a fresh DB too.
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // 1. New table -------------------------------------------------------
    await queryInterface.createTable('event_registrations', {
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
        onDelete: 'CASCADE',
      },
      event_post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'eventposts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ticket_uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      is_attended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('event_registrations', ['user_id', 'event_post_id'], {
      unique: true,
      name: 'event_registrations_user_event_unique',
    });

    // 2. Move existing registration rows ---------------------------------
    // The new ticket_uuid column has a DEFAULT, so we copy the existing
    // ticket_uuid verbatim — that way already-issued QR codes keep working
    // if anyone bookmarked them.
    await queryInterface.sequelize.query(`
      INSERT INTO event_registrations
        (user_id, event_post_id, ticket_uuid, is_attended, registered_at)
      SELECT
        "userId", "eventpostId", ticket_uuid, is_attended, registered_at
      FROM watchlists
      WHERE registered_at IS NOT NULL;
    `);

    // 3. Drop the migrated rows from watchlists --------------------------
    await queryInterface.sequelize.query(`
      DELETE FROM watchlists WHERE registered_at IS NOT NULL;
    `);

    // 4. Drop the registration-only columns from watchlists --------------
    // Postgres drops dependent unique indexes (e.g. watchlists_ticket_uuid_key)
    // automatically together with their column.
    await queryInterface.removeColumn('watchlists', 'registered_at');
    await queryInterface.removeColumn('watchlists', 'is_attended');
    await queryInterface.removeColumn('watchlists', 'ticket_uuid');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Re-add the columns. Nullable for `registered_at` so we can populate
    //    safely; the legacy schema had them all in place from Stage 1.
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

    // 2. Bring the registration data back. If a user since favorited an
    //    event they previously registered for, the favorite row gets
    //    enriched with the registration fields via ON CONFLICT … UPDATE.
    await queryInterface.sequelize.query(`
      INSERT INTO watchlists
        ("userId", "eventpostId", ticket_uuid, is_attended, registered_at, "createdAt", "updatedAt")
      SELECT user_id, event_post_id, ticket_uuid, is_attended, registered_at, registered_at, NOW()
      FROM event_registrations
      ON CONFLICT ("userId", "eventpostId") DO UPDATE SET
        ticket_uuid   = EXCLUDED.ticket_uuid,
        is_attended   = EXCLUDED.is_attended,
        registered_at = EXCLUDED.registered_at;
    `);

    // 3. Drop the new table.
    await queryInterface.dropTable('event_registrations');
  },
};
