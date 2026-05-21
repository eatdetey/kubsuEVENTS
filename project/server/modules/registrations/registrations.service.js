const { v4: uuidv4 } = require('uuid');
const { Watchlist, EventPost, User } = require('../../models/models');
const ServiceError = require('../../utils/ServiceError');

const ATTENDEE_ATTRS = ['id', 'username'];

async function getEventOr404(eventId) {
  const event = await EventPost.findByPk(eventId);
  if (!event) {
    throw new ServiceError(404, 'Event not found');
  }
  return event;
}

// Registers the current user for an event. A registration row lives in the
// watchlist table (it carries ticket_uuid / is_attended / registered_at).
async function registerForEvent(userId, eventId) {
  const event = await getEventOr404(eventId);

  if (!event.registration_required) {
    throw new ServiceError(400, 'Registration is not required for this event');
  }

  const existing = await Watchlist.findOne({
    where: { userId, eventpostId: eventId },
  });
  if (existing) {
    throw new ServiceError(409, 'Already registered');
  }

  if (event.max_participants != null) {
    const current = await Watchlist.count({ where: { eventpostId: eventId } });
    if (current >= event.max_participants) {
      throw new ServiceError(409, 'Event is full');
    }
  }

  const row = await Watchlist.create({
    userId,
    eventpostId: eventId,
    ticket_uuid: uuidv4(),
    is_attended: false,
    registered_at: new Date(),
  });

  return {
    ticketUuid: row.ticket_uuid,
    eventId,
    registeredAt: row.registered_at,
  };
}

async function getTicket(userId, eventId) {
  const row = await Watchlist.findOne({
    where: { userId, eventpostId: eventId },
    include: [{ model: EventPost }],
  });
  if (!row) {
    throw new ServiceError(404, 'Ticket not found');
  }
  return {
    ticketUuid: row.ticket_uuid,
    eventId,
    registeredAt: row.registered_at,
    isAttended: row.is_attended,
    event: {
      title: row.eventpost ? row.eventpost.title : null,
      date: row.eventpost ? row.eventpost.starts : null,
    },
  };
}

async function cancelRegistration(userId, eventId) {
  const row = await Watchlist.findOne({
    where: { userId, eventpostId: eventId },
  });
  if (!row) {
    throw new ServiceError(404, 'Registration not found');
  }
  if (row.is_attended) {
    throw new ServiceError(400, 'Cannot cancel after check-in');
  }
  await row.destroy();
  return { cancelled: true };
}

// Scans a ticket: marks the registration as attended. Used by SECURITY staff.
async function checkIn(ticketUuid) {
  const row = await Watchlist.findOne({
    where: { ticket_uuid: ticketUuid },
    include: [
      { model: EventPost },
      { model: User, attributes: ATTENDEE_ATTRS },
    ],
  });
  if (!row) {
    throw new ServiceError(404, 'Ticket not found');
  }
  if (row.is_attended) {
    throw new ServiceError(409, 'Ticket already used');
  }
  row.is_attended = true;
  await row.save();
  return {
    success: true,
    attendee: {
      userId: row.user ? row.user.id : row.userId,
      username: row.user ? row.user.username : null,
    },
    event: {
      id: row.eventpost ? row.eventpost.id : row.eventpostId,
      title: row.eventpost ? row.eventpost.title : null,
    },
  };
}

async function listRegistrations(eventId, { page, limit, offset }) {
  await getEventOr404(eventId);

  const { count, rows } = await Watchlist.findAndCountAll({
    where: { eventpostId: eventId },
    include: [{ model: User, attributes: ATTENDEE_ATTRS }],
    order: [['registered_at', 'DESC']],
    limit,
    offset,
  });

  // Stats are computed over the whole event, not just the current page.
  const attended = await Watchlist.count({
    where: { eventpostId: eventId, is_attended: true },
  });

  return {
    data: rows.map((r) => ({
      userId: r.user ? r.user.id : r.userId,
      username: r.user ? r.user.username : null,
      registeredAt: r.registered_at,
      isAttended: r.is_attended,
      ticketUuid: r.ticket_uuid,
    })),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 0,
    },
    stats: {
      total: count,
      attended,
      pending: count - attended,
    },
  };
}

module.exports = {
  registerForEvent,
  getTicket,
  cancelRegistration,
  checkIn,
  listRegistrations,
};
