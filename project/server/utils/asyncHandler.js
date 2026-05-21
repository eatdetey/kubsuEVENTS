const ServiceError = require('./ServiceError');
const { sendError } = require('./response');

// Wraps an async controller method: turns a thrown ServiceError into the
// matching HTTP response and any unexpected error into a 500. New modules use
// this instead of the legacy (buggy) global error middleware.
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    if (e instanceof ServiceError) {
      return sendError(res, e.message, e.status);
    }
    console.error(e);
    return sendError(res, 'Internal server error', 500);
  }
};

module.exports = asyncHandler;
