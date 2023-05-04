import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';
import { OpenAPIV3 } from 'openapi-types';

const enumWasNarrowed = (before: any[], after: any[]): boolean => {
  if (after.length < before.length) return true;
  const afterSet = new Set(after);
  for (const beforeItem of before.values()) {
    if (!afterSet.has(beforeItem)) return true;
  }
  return false;
};

type SchemaWithEnum = OpenAPIV3.SchemaObject &
  ({ enum: any[] } | { const: any });

const isSchemaWithEnum = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): obj is SchemaWithEnum => {
  if (!obj) return false;
  return ('enum' in obj && Array.isArray(obj.enum)) || 'const' in obj;
};

const getEnumFromSchema = (schemaWithEnum: SchemaWithEnum): any[] => {
  if ('enum' in schemaWithEnum && Array.isArray(schemaWithEnum.enum)) {
    return schemaWithEnum.enum;
  }
  if ('const' in schemaWithEnum) {
    return [schemaWithEnum.const];
  }
  return [];
};

const getRuleName = <P extends ParameterIn>(parameterIn: P) =>
  `prevent ${parameterIn} parameters enum breaking changes` as const;

const getPreventParameterEnumBreak = <P extends ParameterIn>(parameterIn: P) =>
  new OperationRule({
    name: getRuleName(parameterIn),
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.changed((before, after) => {
        const enumNarrowed =
          isSchemaWithEnum(before.value?.schema) &&
          isSchemaWithEnum(after.value?.schema) &&
          enumWasNarrowed(
            getEnumFromSchema(before.value.schema),
            getEnumFromSchema(after.value.schema)
          );

        if (enumNarrowed) {
          throw new RuleError({
            message: `cannot remove an enum from ${parameterIn} parameter '${after.value.name}'. This is a breaking change.`,
          });
        }
      });

      parameter.changed((before, after) => {
        const enumNewlyAdded =
          !isSchemaWithEnum(before.value?.schema) &&
          isSchemaWithEnum(after.value?.schema);

        if (enumNewlyAdded) {
          throw new RuleError({
            message: `cannot add an enum to restrict possible values for ${parameterIn} parameter '${after.value.name}'. This is a breaking change.`,
          });
        }
      });
    },
  });

export const preventQueryParameterEnumBreak = () =>
  getPreventParameterEnumBreak('query');

export const preventCookieParameterEnumBreak = () =>
  getPreventParameterEnumBreak('cookie');

export const preventPathParameterEnumBreak = () =>
  getPreventParameterEnumBreak('path');

export const preventHeaderParameterEnumBreak = () =>
  getPreventParameterEnumBreak('header');
