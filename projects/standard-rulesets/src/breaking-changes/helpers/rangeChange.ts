import { OpenApi3SchemaFact } from '@useoptic/openapi-utilities';
import { RuleError } from '@useoptic/rulesets-base';

export function isNumericProperty(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  const numericTypes = ['integer', 'number'];
  if (typeof before.type === 'string' && typeof after.type === 'string') {
    return (
      numericTypes.includes(before.type) && numericTypes.includes(before.type)
    );
  }
  return false;
}

export function numericMaximumRangeShouldNotIncrease(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  if (isNumericProperty(before, after)) {
    if (
      typeof before.maximum !== 'undefined' &&
      typeof after.maximum !== 'undefined'
    ) {
      if (before.maximum < after.maximum) {
        throw new RuleError({
          message: `range maximum increased: ${before.maximum} -> ${after.maximum}`,
        });
      }
    }
  }
}

export function numericMinimumRangeShouldNotDecrease(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  if (isNumericProperty(before, after)) {
    if (
      typeof before.minimum !== 'undefined' &&
      typeof after.minimum !== 'undefined'
    ) {
      if (before.minimum > after.minimum) {
        throw new RuleError({
          message: `range minimum decreased: ${before.minimum} -> ${after.minimum}`,
        });
      }
    }
  }
}
