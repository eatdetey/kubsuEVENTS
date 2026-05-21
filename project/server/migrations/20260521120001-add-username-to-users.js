'use strict';

// Adds a human-readable handle to users. The model previously exposed only
// email/password/role, but the Stage 3 API needs author/attendee payloads
// without leaking email. Column is nullable: the registration controller is
// intentionally left untouched in this stage, so new rows get NULL until that
// controller is updated. Existing rows are backfilled from the email local-part.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'username');
  },
};
