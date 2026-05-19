const ROLES = Object.freeze({
  USER:     'USER',
  SECURITY: 'SECURITY',
  EDITOR:   'EDITOR',
  MOD:      'MOD',
  ADMIN:    'ADMIN',
});

const ROLE_HIERARCHY = Object.freeze({
  USER:     0,
  SECURITY: 1,
  EDITOR:   2,
  MOD:      3,
  ADMIN:    4,
});

module.exports = { ROLES, ROLE_HIERARCHY };
