import { $authHost } from './index';

export const registerForEvent = async (eventId) => {
  const { data } = await $authHost.post(`api/events/${eventId}/register`);
  return data; // { ticketUuid, eventId, registeredAt }
};

export const fetchMyTicket = async (eventId) => {
  const { data } = await $authHost.get(`api/events/${eventId}/ticket`);
  return data; // { ticketUuid, eventId, registeredAt, isAttended, event:{title,date} }
};

export const cancelRegistration = async (eventId) => {
  const { data } = await $authHost.delete(`api/events/${eventId}/register`);
  return data; // { cancelled: true }
};

export const fetchEventRegistrations = async (eventId, page = 1, limit = 20) => {
  const { data } = await $authHost.get(
    `api/events/${eventId}/registrations?page=${page}&limit=${limit}`
  );
  return data; // { data, pagination, stats }
};

export const checkInTicket = async (ticketUuid) => {
  const { data } = await $authHost.post('api/events/check-in', { ticketUuid });
  return data; // { success, attendee, event }
};

// Personal-cabinet endpoint added with the favorites/registrations split.
// Returns the current user's registrations with light event payloads.
export const fetchMyRegistrations = async () => {
  const { data } = await $authHost.get('api/users/me/registrations');
  return data; // [{ ticketUuid, registeredAt, isAttended, event: {...} }]
};
