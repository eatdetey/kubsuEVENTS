'use strict';

// Roles column is VARCHAR(255) (not ENUM in this project). We keep the type,
// normalize legacy lower-case values to the new uppercase canonical set, then
// add a CHECK constraint that pins the column to the 5 supported roles.
//
// Legacy → new mapping:
//   'user'      → 'USER'
//   'moderator' → 'MOD'
//   'admin'     → 'ADMIN'
// Current production data is already uppercase, so the UPDATE is mostly a
// no-op safety net for any seed/legacy rows that might still be in lower case.

const NEW_ROLES = ['USER', 'SECURITY', 'EDITOR', 'MOD', 'ADMIN'];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = CASE LOWER(role)
        WHEN 'user'      THEN 'USER'
        WHEN 'moderator' THEN 'MOD'
        WHEN 'admin'     THEN 'ADMIN'
        ELSE role
      END;
    `);

    // Drop a previous incarnation of the constraint if a partial re-run left it.
    await queryInterface.sequelize.query(
      'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
    );

    const allowed = NEW_ROLES.map((r) => `'${r}'`).join(', ');
    await queryInterface.sequelize.query(
      `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (${allowed}));`
    );

    // Make sure the default lines up with the new canonical set.
    await queryInterface.sequelize.query(
      `ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;'
    );

    // Reverse mapping. SECURITY/EDITOR had no pre-Stage-2 equivalent so they
    // collapse back to 'user' per the spec.
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = CASE role
        WHEN 'USER'     THEN 'user'
        WHEN 'SECURITY' THEN 'user'
        WHEN 'EDITOR'   THEN 'user'
        WHEN 'MOD'      THEN 'moderator'
        WHEN 'ADMIN'    THEN 'admin'
        ELSE role
      END;
    `);

    await queryInterface.sequelize.query(
      `ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';`
    );
  },
};
