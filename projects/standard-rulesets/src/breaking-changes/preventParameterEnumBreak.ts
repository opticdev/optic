import {
  Assertions,
  AssertionType,
  OperationRule,
  RuleError,
  OperationAssertions,
} from '@useoptic/rulesets-base';

import { OpenAPIV3 } from 'openapi-types';

type ParameterIn = 'cookie' | 'query' | 'header' | 'path';
type ParamAssertionType = Extract<
  AssertionType,
  'query-parameter' | 'path-parameter' | 'header-parameter' | 'cookie-parameter'
>;

const unhandledCase = (x: never) => {
  throw new Error(`received unexpected runtime value ${x}`);
};

const getOperationAssertionsParameter = (
  operationAssertions: OperationAssertions,
  parameterIn: ParameterIn
): Assertions<ParamAssertionType> => {
  switch (parameterIn) {
    case 'query':
      return operationAssertions.queryParameter;
    case 'path':
      return operationAssertions.pathParameter;
    case 'cookie':
      return operationAssertions.cookieParameter;
    case 'header':
      return operationAssertions.headerParameter;
    default:
      return unhandledCase(parameterIn);
  }
};

const enumWasNarrowed = (before: any[], after: any[]): boolean => {
  if (after.length < before.length) return true;
  const afterSet = new Set(after);
  for (const beforeItem of before.values()) {
    if (!afterSet.has(beforeItem)) return true;
  }
  return false;
};

type SchemaWithEnum = OpenAPIV3.SchemaObject & { enum: any[] };

const isSchemaWithEnum = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): obj is SchemaWithEnum => {
  if (!obj) return false;
  return 'enum' in obj && Array.isArray(obj.enum);
};

const getPreventParameterEnumBreak = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: `prevent ${parameterIn} parameters enum breaking changes`,
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.changed(
        `not remove possible values from a ${parameterIn} parameter enum`,
        (before, after) => {
          const enumNarrowed =
            isSchemaWithEnum(before.value?.schema) &&
            isSchemaWithEnum(after.value?.schema) &&
            enumWasNarrowed(before.value.schema.enum, after.value.schema.enum);

          if (enumNarrowed) {
            throw new RuleError({
              message: `cannot remove possible values from a ${parameterIn} parameter enum`,
            });
          }
        }
      );

      parameter.changed(
        `not add an enum to restrict possible values for a ${parameterIn} parameter`,
        (before, after) => {
          const enumNewlyAdded =
            !isSchemaWithEnum(before.value?.schema) &&
            isSchemaWithEnum(after.value?.schema);

          if (enumNewlyAdded) {
            throw new RuleError({
              message: `cannot add an enum to restrict possible values for a ${parameterIn} parameter`,
            });
          }
        }
      );
    },
  });

export const preventQueryParameterEnumBreak =
  getPreventParameterEnumBreak('query');

export const preventCookieParameterEnumBreak =
  getPreventParameterEnumBreak('cookie');

export const preventPathParameterEnumBreak =
  getPreventParameterEnumBreak('path');

export const preventHeaderParameterEnumBreak =
  getPreventParameterEnumBreak('header');
