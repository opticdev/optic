import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';

const getPreventParameterTypeChange = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: `prevent ${parameterIn} parameters type changes`,
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.changed('not change parameter type', (before, after) => {
        // TODO: this has some possible false positives as something could change from having a type
        //  to being a oneOf, anyOf, or allOf
        if (
          before.value.schema &&
          'type' in before.value.schema &&
          after.value.schema &&
          'type' in after.value.schema &&
          before.value.schema.type !== after.value.schema.type
        ) {
          throw new RuleError({
            message: `expected ${parameterIn} parameter to not change type`,
          });
        }
      });
    },
  });

export const preventQueryParameterTypeChange =
  getPreventParameterTypeChange('query');

export const preventCookieParameterTypeChange =
  getPreventParameterTypeChange('cookie');

export const preventPathParameterTypeChange =
  getPreventParameterTypeChange('path');

export const preventHeaderParameterTypeChange =
  getPreventParameterTypeChange('header');
