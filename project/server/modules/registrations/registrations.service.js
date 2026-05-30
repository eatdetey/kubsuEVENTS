const { v4: uuidv4 } = require('uuid');
const { EventRegistration, EventPost, User } = require('../../models/models');
const ServiceError = require('../../utils/ServiceError');

const ATTENDEE_ATTRS = ['id', 'username'];

async function getEventOr404(eventId) {
  const event = await EventPost.findByPk(eventId);
  if (!event) {
    throw new ServiceError(404, 'Event not found');
  }
  return event;
}

// All `EventRegistration` columns are snake_case (model has underscored:true),
// but the association `belongsTo(EventPost)` is declared without an alias,
// so the eager-loaded accessor follows Sequelize's default plural rules.
// Using the explicit foreignKey on the association keeps row.user_id and
// row.event_post_id aligned with the column names.

async function registerForEvent(userId, eventId) {
  const event = await getEventOr404(eventId);

  if (!event.registration_required) {
    throw new ServiceError(400, 'Registration is not required for this event');
  }

  const existing = await EventRegistration.findOne({
    where: { user_id: userId, event_post_id: eventId },
  });
  if (existing) {
    throw new ServiceError(409, 'Already registered');
  }

  if (event.max_participants != null) {
    const current = await EventRegistration.count({
      where: { event_post_id: eventId },
    });
    if (current >= event.max_participants) {
      throw new ServiceError(409, 'Event is full');
    }
  }

  const row = await EventRegistration.create({
    user_id: userId,
    event_post_id: eventId,
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
  const row = await EventRegistration.findOne({
    where: { user_id: userId, event_post_id: eventId },
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
  const row = await EventRegistration.findOne({
    where: { user_id: userId, event_post_id: eventId },
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
  const row = await EventRegistration.findOne({
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
      userId: row.user ? row.user.id : row.user_id,
      username: row.user ? row.user.username : null,
    },
    event: {
      id: row.eventpost ? row.eventpost.id : row.event_post_id,
      title: row.eventpost ? row.eventpost.title : null,
    },
  };
}

async function listRegistrations(eventId, { page, limit, offset }) {
  await getEventOr404(eventId);

  const { count, rows } = await EventRegistration.findAndCountAll({
    where: { event_post_id: eventId },
    include: [{ model: User, attributes: ATTENDEE_ATTRS }],
    order: [['registered_at', 'DESC']],
    limit,
    offset,
  });

  // Stats are computed over the whole event, not just the current page.
  const attended = await EventRegistration.count({
    where: { event_post_id: eventId, is_attended: true },
  });

  return {
    data: rows.map((r) => ({
      userId: r.user ? r.user.id : r.user_id,
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

// Used by the personal cabinet: "My registrations" block.
async function listMyRegistrations(userId) {
  const rows = await EventRegistration.findAll({
    where: { user_id: userId },
    include: [{ model: EventPost }],
    order: [['registered_at', 'DESC']],
  });
  return rows
    .filter((r) => r.eventpost)
    .map((r) => ({
      ticketUuid: r.ticket_uuid,
      registeredAt: r.registered_at,
      isAttended: r.is_attended,
      event: {
        id: r.eventpost.id,
        title: r.eventpost.title,
        starts: r.eventpost.starts,
        place: r.eventpost.place,
        img: r.eventpost.img,
      },
    }));
}

module.exports = {
  registerForEvent,
  getTicket,
  cancelRegistration,
  checkIn,
  listRegistrations,
  listMyRegistrations,
};
