import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import {
  AssertString,
  StringAssertion,
  StringAssertionMarkdown,
} from './assertions/string';
import {
  BooleanAssertion,
  BooleanAssertionMarkdown,
} from './assertions/boolean';
import exp from 'constants';
import { SchemaAssertion, SchemaAssertionMarkdown } from './assertions/schema';
import { bullets, indent } from './markdown/util';

type Context = OpenApiRequestParameterFact;

interface ParameterStandardInput {
  name?: string;
  description?: StringAssertion<OpenApiRequestParameterFact>;
  required?: BooleanAssertion<OpenApiRequestParameterFact>;
  explode?: BooleanAssertion<OpenApiRequestParameterFact>;
  style?: StringAssertion<OpenApiRequestParameterFact>;
  schema?: SchemaAssertion<OpenApiRequestParameterFact>;
}

type UnionParameterKinds =
  | OpenApiKind.QueryParameter
  | OpenApiKind.HeaderParameter
  | OpenApiKind.PathParameter
  | OpenApiKind.CookieParameter;

type ParameterExpandedInput = {
  when?: (
    parameter: OpenApiRequestParameterFact,
    context: {
      raw: OpenAPIV3.OperationObject;
      operation: OpenApiOperationFact;
    }
  ) => boolean;
  applyStandards?: ParameterStandardInput;
  description?: string;
  docsLinks?: string;
};

export type Parameter = StandardBase & {
  kind: UnionParameterKinds;
};

export function Parameter(
  standardName: string,
  parameterIn: 'query' | 'path' | 'header' | 'cookie',
  input: ParameterExpandedInput
): Parameter {
  const mapOfInToKind: { [key: string]: UnionParameterKinds } = {
    query: OpenApiKind.QueryParameter,
    header: OpenApiKind.HeaderParameter,
    path: OpenApiKind.PathParameter,
    cookie: OpenApiKind.CookieParameter,
  };

  return {
    kind: mapOfInToKind[parameterIn],
    toRules: () => {
      return [];
    },
    toMarkdown: () => {
      const name = input?.applyStandards?.name;
      const identifier = name
        ? `${parameterIn} parameter named \`${name}\` `
        : `${parameterIn} parameters`;

      // `${parameterIn} named \`${}\` `

      const rules: ParameterStandardInput = input.applyStandards || {};

      return `${identifier}${indent(
        bullets(
          name
            ? `must be included in the documented \`parameters\` `
            : undefined,
          StringAssertionMarkdown('style', rules.style),
          StringAssertionMarkdown('description', rules.description),
          BooleanAssertionMarkdown('required', rules.required),
          SchemaAssertionMarkdown('schema', rules.schema)
        )
      )}`;
    },
  };
}

export function QueryParameter(
  standardsName: string,
  check: ParameterExpandedInput
) {
  return Parameter(standardsName, 'query', check);
}
export function HeaderParameter(
  standardsName: string,
  check: ParameterExpandedInput
) {
  return Parameter(standardsName, 'header', check);
}
export function PathParameter(
  standardsName: string,
  check: ParameterExpandedInput
) {
  return Parameter(standardsName, 'path', check);
}
export function CookieParameter(
  standardsName: string,
  check: ParameterExpandedInput
) {
  return Parameter(standardsName, 'cookie', check);
}
