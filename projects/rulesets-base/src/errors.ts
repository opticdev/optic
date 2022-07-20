type RuleConfig = {
  message: string;
} & (
  | {
      expected?: undefined;
      received?: undefined;
    }
  | {
      expected: any;
      received: any;
    }
);

export class RuleError extends Error {
  public type: 'rule-error';
  constructor(public details: RuleConfig) {
    super(details.message);
    this.type = 'rule-error';
    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RuleError.prototype);
  }

  toString(): string {
    return this.details.message;
  }

  static isInstance(v: any): v is RuleError {
    return v?.type === 'rule-error';
  }
}
