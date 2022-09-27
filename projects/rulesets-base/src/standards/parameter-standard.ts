import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { AssertString, StringAssertion } from './assertions/strings';
import { BooleanAssertion } from './assertions/boolean';
import exp from 'constants';

type Context = OpenApiRequestParameterFact;

interface ParameterStandardInput {
  name?: StringAssertion<OpenApiRequestParameterFact>;
  description?: StringAssertion<OpenApiRequestParameterFact>;
  required?: BooleanAssertion<OpenApiRequestParameterFact>;
  explode?: BooleanAssertion<OpenApiRequestParameterFact>;
  style?: StringAssertion<OpenApiRequestParameterFact>;
  // schema
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

export type ParameterStandard = StandardBase & {
  kind: UnionParameterKinds;
};

export function Parameter(
  standardName: string,
  parameterIn: 'query' | 'path' | 'header' | 'cookie',
  input: ParameterExpandedInput
): ParameterStandard {
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
    toMarkdown: () => ``,
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
