import {
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import {
  numericMaximumRangeShouldNotExpand,
  numericMinimumRangeShouldNotExpand,
} from './helpers/rangeChange';

export const preventRequestPropertyRangeChanges = new RequestRule({
  name: 'prevent request property breaking range changes',
  rule: (requestAssertions) => {
    requestAssertions.property.changed((before, after) => {
      numericMaximumRangeShouldNotExpand(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    requestAssertions.property.changed((before, after) => {
      numericMinimumRangeShouldNotExpand(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});

export const preventResponsePropertyRangeChanges = new ResponseBodyRule({
  name: 'prevent response property breaking range changes',
  rule: (responseAssertions) => {
    responseAssertions.property.changed((before, after) => {
      numericMaximumRangeShouldNotExpand(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });

    responseAssertions.property.changed((before, after) => {
      numericMinimumRangeShouldNotExpand(
        before.value.flatSchema,
        after.value.flatSchema
      );
    });
  },
});
