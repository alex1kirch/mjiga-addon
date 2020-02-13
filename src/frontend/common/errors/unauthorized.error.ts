export default class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'Azure Cards App does not authorized yet. You must install application to get full functionality.',
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'UnauthorizedError';
  }
}
