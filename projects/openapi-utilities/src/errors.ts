export class UserError extends Error {
  public type: 'user-error';

  constructor(message?: string) {
    super(message);
    this.name = 'UserError';
    this.type = 'user-error';

    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UserError.prototype);
  }

  static isInstance(v: any): v is UserError {
    return v?.type === 'rule-error';
  }
}
