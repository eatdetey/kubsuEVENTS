const registrationsService = require('./registrations.service');
const { parseIntId, parsePagination } = require('../../utils/validate');
const ServiceError = require('../../utils/ServiceError');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class RegistrationsController {
  async register(req, res) {
    const eventId = parseIntId(req.params.eventId, 'eventId');
    const result = await registrationsService.registerForEvent(
      req.user.id,
      eventId
    );
    return res.status(201).json(result);
  }

  async getTicket(req, res) {
    const eventId = parseIntId(req.params.eventId, 'eventId');
    const result = await registrationsService.getTicket(req.user.id, eventId);
    return res.status(200).json(result);
  }

  async cancel(req, res) {
    const eventId = parseIntId(req.params.eventId, 'eventId');
    const result = await registrationsService.cancelRegistration(
      req.user.id,
      eventId
    );
    return res.status(200).json(result);
  }

  async checkIn(req, res) {
    // TODO: replace manual validation with a validation library (joi/zod) if
    // one is added to the project later.
    const { ticketUuid } = req.body || {};
    if (typeof ticketUuid !== 'string' || !UUID_RE.test(ticketUuid)) {
      throw new ServiceError(400, 'ticketUuid must be a valid UUID');
    }
    const result = await registrationsService.checkIn(ticketUuid);
    return res.status(200).json(result);
  }

  async listRegistrations(req, res) {
    const eventId = parseIntId(req.params.eventId, 'eventId');
    const { page, limit, offset } = parsePagination(req.query);
    const result = await registrationsService.listRegistrations(eventId, {
      page,
      limit,
      offset,
    });
    return res.status(200).json(result);
  }
}

module.exports = new RegistrationsController();
