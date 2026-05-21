// Typed error thrown by service-layer code. The controller / asyncHandler maps
// `status` straight onto the HTTP response, so services can signal 400/403/404/
// 409 without knowing anything about Express.
class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

module.exports = ServiceError;
