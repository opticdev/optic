import {
  OperationRule,
  PropertyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';
import { OpenAPIV3 } from 'openapi-types';
import { isInUnionProperty } from './helpers/unions';
import { diffSets } from './helpers/type-change';

const InfiniteSet = Symbol('infinite enum set');

const isSchemaWithEnum = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): boolean => {
  if (!obj) return false;
  return ('enum' in obj && Array.isArray(obj.enum)) || 'const' in obj;
};

const getEnumFromSchema = (
  schemaWithEnum: OpenAPIV3.SchemaObject
): any[] | typeof InfiniteSet => {
  if ('enum' in schemaWithEnum && Array.isArray(schemaWithEnum.enum)) {
    return schemaWithEnum.enum;
  }
  if ('const' in schemaWithEnum) {
    return [schemaWithEnum.const];
  }
  return InfiniteSet;
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
        if (
          !(
            isSchemaWithEnum(before.value?.schema) ||
            isSchemaWithEnum(after.value?.schema)
          )
        ) {
          return;
        }

        const beforeEnum = getEnumFromSchema(
          before.value?.schema as OpenAPIV3.SchemaObject
        );
        const afterEnum = getEnumFromSchema(
          after.value?.schema as OpenAPIV3.SchemaObject
        );
        if (beforeEnum === InfiniteSet || afterEnum === InfiniteSet) {
          if (beforeEnum === InfiniteSet && afterEnum !== InfiniteSet) {
            throw new RuleError({
              message: `cannot add an enum to restrict possible values for ${parameterIn} parameter ${after.value.name}. This is a breaking change.`,
            });
          } else {
            return;
          }
        }
        const enumDiff =
          (isSchemaWithEnum(before.value?.schema) ||
            isSchemaWithEnum(after.value?.schema)) &&
          diffSets(new Set(beforeEnum), new Set(afterEnum));

        if (enumDiff && enumDiff.narrowed.length) {
          throw new RuleError({
            message: `cannot remove enum option${
              enumDiff.narrowed.length > 1 ? 's' : ''
            } '${enumDiff.narrowed.join(
              ', '
            )}' from ${parameterIn} parameter '${
              after.value.name
            }'. This is a breaking change.`,
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

export const preventPropertyEnumBreak = () => {
  return new PropertyRule({
    name: 'request and response property enums',
    matches: (property, context) => isSchemaWithEnum(property.raw),
    rule: (property, context) => {
      property.changed((before, after) => {
        if (
          isInUnionProperty(before.location.jsonPath) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }

        if (!(isSchemaWithEnum(before.raw) || isSchemaWithEnum(after.raw))) {
          return;
        }
        const inRequest = 'inRequest' in after.location.conceptualLocation;
        const beforeEnum = getEnumFromSchema(before.raw);
        const afterEnum = getEnumFromSchema(after.raw);
        if (beforeEnum === InfiniteSet || afterEnum === InfiniteSet) {
          if (
            inRequest &&
            beforeEnum === InfiniteSet &&
            afterEnum !== InfiniteSet
          ) {
            throw new RuleError({
              message: `cannot add enum or const to request property ${after.value.key}. This is a breaking change.`,
            });
          } else if (
            !inRequest &&
            beforeEnum !== InfiniteSet &&
            afterEnum === InfiniteSet
          ) {
            throw new RuleError({
              message: `cannot remove enum or const from response property ${after.value.key}. This is a breaking change.`,
            });
          }
          return;
        }

        let beforeSet = new Set(beforeEnum);
        let afterSet = new Set(afterEnum);
        const results = diffSets(beforeSet, afterSet);
        if (inRequest && results.narrowed.length) {
          throw new RuleError({
            message: `cannot remove enum option${
              results.narrowed.length > 1 ? 's' : ''
            } '${results.narrowed.join(', ')}' from '${
              after.value.key
            }' property. This is a breaking change.`,
          });
        } else if (!inRequest && results.expanded.length) {
          throw new RuleError({
            message: `cannot add enum option${
              results.expanded.length > 1 ? 's' : ''
            } '${results.expanded.join(', ')}' from '${
              after.value.key
            }' property. This is a breaking change.`,
          });
        }
      });
    },
  });
};
