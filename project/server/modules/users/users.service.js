const { User } = require('../../models/models');
const { ROLES } = require('../../constants/roles');
const ServiceError = require('../../utils/ServiceError');

// Only public, non-sensitive fields are ever returned — never password/email
// hash artefacts.
const USER_ATTRS = ['id', 'email', 'username', 'role'];

function toUserDTO(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

// Admin-only: change another user's role. The caller themselves cannot be the
// target — preventing an admin from accidentally demoting themselves and
// locking the system out of admin actions.
async function changeUserRole(adminId, targetUserId, newRole) {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new ServiceError(
      400,
      `Unknown role; expected one of ${Object.values(ROLES).join(', ')}`
    );
  }

  if (adminId === targetUserId) {
    throw new ServiceError(400, 'Cannot change your own role');
  }

  const user = await User.findByPk(targetUserId, { attributes: USER_ATTRS });
  if (!user) {
    throw new ServiceError(404, 'User not found');
  }

  if (user.role === newRole) {
    return toUserDTO(user);
  }

  user.role = newRole;
  await user.save();
  return toUserDTO(user);
}

module.exports = { changeUserRole };
