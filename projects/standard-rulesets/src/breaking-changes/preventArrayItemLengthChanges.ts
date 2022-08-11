import {
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import {
  arrayMaxItemsShouldNotIncrease,
  arrayMinItemsShouldNotDecrease,
  numericMaximumRangeShouldNotExpand,
  numericMinimumRangeShouldNotExpand,
} from './helpers/rangeChange';

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
