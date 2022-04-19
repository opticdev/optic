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
  constructor(details: RuleConfig) {
    super(details.message);

    // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RuleError.prototype);
  }
}
