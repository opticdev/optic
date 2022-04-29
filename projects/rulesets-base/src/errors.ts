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
  constructor(private details: RuleConfig) {
    super(details.message);

    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RuleError.prototype);
  }

  toString(): string {
    return this.details.received && this.details.expected
      ? `${this.details.message}. Expected value ${JSON.stringify(
          this.details.expected
        )} but received ${JSON.stringify(this.details.received)}`
      : this.details.message;
  }
}
