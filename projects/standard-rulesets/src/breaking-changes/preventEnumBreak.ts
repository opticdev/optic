import {
  OperationRule,
  PropertyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';
import { OpenAPIV3 } from 'openapi-types';
import { isInUnionProperty } from './helpers/unions';

const enumWasNarrowed = (before: any[], after: any[]): string[] | false => {
  let beforeSet = new Set(before);
  let afterSet = new Set(after);
  const setDiff = new Set([...beforeSet].filter((x) => !afterSet.has(x)));

  if (setDiff.size) {
    return [...setDiff];
  } else {
    return false;
  }
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
            message: `cannot remove enum option${
              enumNarrowed.length > 1 ? 's' : ''
            } '${enumNarrowed.join(', ')}' from ${parameterIn} parameter '${
              after.value.name
            }'. This is a breaking change.`,
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

        const enumNarrowed =
          isSchemaWithEnum(before.raw) &&
          isSchemaWithEnum(after.raw) &&
          enumWasNarrowed(
            getEnumFromSchema(before.raw),
            getEnumFromSchema(after.raw)
          );

        if (enumNarrowed) {
          throw new RuleError({
            message: `cannot remove enum option${
              enumNarrowed.length > 1 ? 's' : ''
            } '${enumNarrowed.join(', ')}' from '${
              after.value.key
            }' property. This is a breaking change.`,
          });
        }
      });
    },
  });
};
