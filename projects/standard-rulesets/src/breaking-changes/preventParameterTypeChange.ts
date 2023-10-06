import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';
import { computeEffectiveTypeChange } from './helpers/type-change';

const getName = <P extends ParameterIn>(parameterIn: P) =>
  `prevent ${parameterIn} parameters type changes` as const;

export type PreventParameterTypeChangeRuleName = ReturnType<typeof getName>;

const getPreventParameterTypeChange = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: getName(parameterIn),
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.changed((before, after) => {
        // TODO: this has some possible false positives as something could change from having a type
        //  to being a oneOf, anyOf, or allOf
        if (
          before.value.schema &&
          'type' in before.value.schema &&
          after.value.schema &&
          'type' in after.value.schema &&
          computeEffectiveTypeChange(
            before.value.schema.type,
            after.value.schema.type
          ).narrowed
        ) {
          throw new RuleError({
            message: `expected ${parameterIn} parameter '${after.value.name}' not be narrowed. This is a breaking change.`,
          });
        }
      });
    },
  });

export const preventQueryParameterTypeChange = () =>
  getPreventParameterTypeChange('query');

export const preventCookieParameterTypeChange = () =>
  getPreventParameterTypeChange('cookie');

export const preventPathParameterTypeChange = () =>
  getPreventParameterTypeChange('path');

export const preventHeaderParameterTypeChange = () =>
  getPreventParameterTypeChange('header');
