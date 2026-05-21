// Validates and normalizes the Stage 1 geo / registration fields of an
// EventPost create/update payload.
//
// Returns { fields } with only the supplied, valid keys, or { error } with a
// message. `currentRegistrationRequired` is the value already stored on the
// event (used on update when the request omits registration_required).
//
// TODO: replace manual validation with a validation library (joi/zod) if one
// is added to the project later.
function extractEventGeoFields(body = {}, currentRegistrationRequired = false) {
  const fields = {};

  if (body.latitude !== undefined && body.latitude !== null) {
    const lat = Number(body.latitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return { error: 'latitude must be a number between -90 and 90' };
    }
    fields.latitude = lat;
  }

  if (body.longitude !== undefined && body.longitude !== null) {
    const lon = Number(body.longitude);
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      return { error: 'longitude must be a number between -180 and 180' };
    }
    fields.longitude = lon;
  }

  // Effective flag: the incoming value if present, otherwise what is stored.
  let effectiveRegistration = currentRegistrationRequired;
  if (body.registration_required !== undefined) {
    if (typeof body.registration_required !== 'boolean') {
      return { error: 'registration_required must be a boolean' };
    }
    fields.registration_required = body.registration_required;
    effectiveRegistration = body.registration_required;
  }

  if (body.max_participants !== undefined && body.max_participants !== null) {
    const max = Number(body.max_participants);
    if (!Number.isInteger(max) || max <= 0) {
      return { error: 'max_participants must be a positive integer' };
    }
    if (effectiveRegistration) {
      fields.max_participants = max;
    } else {
      // Per spec: a max with registration disabled is dropped, not rejected.
      console.warn(
        '[eventposts] max_participants ignored: registration_required is false'
      );
    }
  }

  return { fields };
}

module.exports = { extractEventGeoFields };
