import {
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import {
  numericMaximumRangeShouldNotIncrease,
  numericMinimumRangeShouldNotDecrease,
} from './helpers/rangeChange';

export const preventRequestPropertyRangeChanges = new RequestRule({
  name: 'prevent request property numeric range changes',
  rule: (requestAssertions) => {
    requestAssertions.property.changed((before, after) => {
      numericMaximumRangeShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    requestAssertions.property.changed((before, after) => {
      numericMinimumRangeShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});

export const preventResponsePropertyRangeChanges = new ResponseBodyRule({
  name: 'prevent response property numeric range changes',
  rule: (responseAssertions) => {
    responseAssertions.property.changed((before, after) => {
      numericMaximumRangeShouldNotIncrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    responseAssertions.property.changed((before, after) => {
      numericMinimumRangeShouldNotDecrease(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});
