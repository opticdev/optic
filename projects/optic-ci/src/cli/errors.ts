export class UserError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UserError';

    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UserError.prototype);
  }
}
