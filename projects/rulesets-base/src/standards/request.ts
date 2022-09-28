import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestFact,
  OpenApiResponseFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { StringAssertion } from './assertions/string';
import { Body } from './body';
import { BooleanAssertion } from './assertions/boolean';

type Context = OpenApiRequestFact;

interface ResponseStandardInput {
  required?: BooleanAssertion<OpenApiRequestFact>;
  content?: { [contentType: string]: Body };
}

export type RequestStandard = StandardBase & {
  kind: OpenApiKind.Request;
};

export function Request(
  standardName: string,
  input?: {
    when?: (
      request: OpenApiRequestFact,
      context: {
        raw: OpenAPIV3.OperationObject;
        operation: OpenApiOperationFact;
      }
    ) => boolean;
    applyStandards?: ResponseStandardInput;
    description?: string;
    docsLinks?: string;
  }
): RequestStandard {
  return {
    kind: OpenApiKind.Request,
    toRules: () => {
      return [];
    },
    toMarkdown: () => ``,
  };
}
