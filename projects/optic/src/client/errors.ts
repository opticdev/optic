export class BadRequestError extends Error {
  code: number;
  source: string;
  constructor(msg: string) {
    super(msg);
    this.code = 400;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error {
  code: number;
  source: string;
  constructor(msg: string) {
    super(msg);
    this.code = 401;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends Error {
  code: number;
  source: string;

  constructor(msg: string) {
    super(msg);
    this.code = 403;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends Error {
  code: number;
  source: string;

  constructor(msg: string = 'Not found') {
    super(msg);
    this.code = 404;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalError extends Error {
  code: number;
  source: string;

  constructor(msg: string) {
    super(msg);
    this.code = 500;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class ServiceUnavailableError extends Error {
  code: number;
  source: string;

  constructor(msg: string) {
    super(msg);
    this.code = 503;
    this.source = 'unknown';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
