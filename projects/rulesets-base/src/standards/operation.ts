import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { AssertString, StringAssertion } from './assertions/string';
import { HeaderParameter, Parameter, QueryParameter } from './parameter';
import { Response, ResponseStandard } from './response';
import { Body } from './body';
import { AssertSchema } from './assertions/schema';
import { Request, RequestStandard } from './request';
import { bullets } from './markdown/util';

type Context = OpenApiOperationFact;

interface OperationStandardInput {
  summary?: StringAssertion<OpenApiOperationFact>;
  tags?: (tags: OpenAPIV3.OperationObject['tags'], context: Context) => void;
  operationId?: StringAssertion<OpenApiOperationFact>;
  parameters?: Parameter[];
  requestBody?: RequestStandard;
  responses?: {
    [key: string]: ResponseStandard;
  };
}

export function Operation(
  standardName: string,
  input: {
    when?: (
      operation: OpenApiOperationFact,
      context: { raw: OpenAPIV3.OperationObject }
    ) => boolean;
    applyStandards?: OperationStandardInput;
    description?: string;
    docsLinks?: string;
  }
): StandardBase & {
  kind: OpenApiKind.Operation;
} {
  return {
    kind: OpenApiKind.Operation,
    toRules: () => {
      return [];
    },
    toMarkdown: () => {
      const text = [`## ${standardName}`, input.description || ''];

      const parameters = input.applyStandards?.parameters || [];
      if (parameters.length) {
        text.push(
          `### Parameters\n${bullets(...parameters.map((i) => i.toMarkdown()))}`
        );
      }

      const responses = input.applyStandards?.responses || {};

      if (Object.keys(responses).length) {
        const keys = Object.keys(responses).sort();
        text.push(
          `### Responses\n${keys
            .map(
              (status) =>
                `#### ${status} Response\n${responses[status].toMarkdown()}`
            )
            .join('\n')}`
        );
      }

      return text.join('\n');
    },
  };
}
