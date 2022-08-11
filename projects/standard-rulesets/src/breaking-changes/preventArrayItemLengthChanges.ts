import {
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { OpenApi3SchemaFact } from '@useoptic/openapi-utilities';

export const preventRequestArrayLengthChanges = new RequestRule({
  name: 'prevent request array length changes',
  rule: (requestAssertions) => {
    requestAssertions.body.changed((before, after) => {
      arrayMaxItemsShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    requestAssertions.body.changed((before, after) => {
      arrayMinItemsShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    requestAssertions.property.changed((before, after) => {
      arrayMaxItemsShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    requestAssertions.property.changed((before, after) => {
      arrayMinItemsShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});

export const preventResponseArrayLengthChanges = new ResponseBodyRule({
  name: 'prevent response array length changes',
  rule: (responseAssertions) => {
    responseAssertions.body.changed((before, after) => {
      arrayMaxItemsShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    responseAssertions.body.changed((before, after) => {
      arrayMinItemsShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    responseAssertions.property.changed((before, after) => {
      arrayMaxItemsShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    responseAssertions.property.changed((before, after) => {
      arrayMinItemsShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});

export function isArrayProperty(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  const numericTypes = ['array'];
  if (typeof before.type === 'string' && typeof after.type === 'string') {
    return (
      numericTypes.includes(before.type) && numericTypes.includes(before.type)
    );
  }
  return false;
}

export function arrayMaxItemsShouldNotIncrease(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  if (isArrayProperty(before, after)) {
    if (
      typeof before.maxItems !== 'undefined' &&
      typeof after.maxItems !== 'undefined'
    ) {
      if (before.maxItems < after.maxItems) {
        throw new RuleError({
          message: `array maxItems  increased: ${before.maxItems} -> ${after.maxItems}`,
        });
      }
    }
  }
}

export function arrayMinItemsShouldNotDecrease(
  before: OpenApi3SchemaFact,
  after: OpenApi3SchemaFact
) {
  if (isArrayProperty(before, after)) {
    if (
      typeof before.minItems !== 'undefined' &&
      typeof after.minItems !== 'undefined'
    ) {
      if (before.minItems > after.minItems) {
        throw new RuleError({
          message: `array minItems decreased: ${before.minItems} -> ${after.minItems}`,
        });
      }
    }
  }
}
