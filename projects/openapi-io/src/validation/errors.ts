export class ValidationError extends Error {
  public type: 'validation-error';

  constructor(message?: string) {
    super(message);
    this.type = 'validation-error';

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static isInstance(v: any): v is OpenAPIVersionError {
    return v?.type === 'validation-error';
  }
}

export class OpenAPIVersionError extends Error {
  public type: 'oas-version-error';
  public version: string | undefined;

  constructor(message?: string, version?: string) {
    super(message);
    this.type = 'oas-version-error';
    this.version = version;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static isInstance(v: any): v is OpenAPIVersionError {
    return v?.type === 'oas-version-error';
  }
}
