const usersService = require('./users.service');
const { parseIntId } = require('../../utils/validate');
const ServiceError = require('../../utils/ServiceError');

class UsersController {
  async changeRole(req, res) {
    const targetUserId = parseIntId(req.params.userId, 'userId');
    const { role } = req.body || {};
    if (typeof role !== 'string' || role.length === 0) {
      throw new ServiceError(400, 'role is required');
    }
    const result = await usersService.changeUserRole(
      req.user.id,
      targetUserId,
      role
    );
    return res.status(200).json(result);
  }
}

module.exports = new UsersController();
