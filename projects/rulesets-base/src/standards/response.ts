import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiResponseFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { StringAssertion } from './assertions/string';
import { BodyStandard } from './body';

type Context = OpenApiResponseFact;

const response: OpenAPIV3.ResponseObject = {
  description: '',
  content: {},
};

interface ResponseStandardInput {
  description?: StringAssertion<OpenApiResponseFact>;
  content: { [contentType: string]: BodyStandard };
}

export type ResponseStandard = StandardBase & {
  kind: OpenApiKind.Response;
};

export function Response(
  standardName: string,
  input?: {
    when?: (
      response: OpenApiResponseFact,
      context: {
        raw: OpenAPIV3.OperationObject;
        operation: OpenApiOperationFact;
      }
    ) => boolean;
    applyStandards?: ResponseStandardInput;
    description?: string;
    docsLinks?: string;
  }
): ResponseStandard {
  return {
    kind: OpenApiKind.Response,
    toRules: () => {
      return [];
    },
    toMarkdown: () => {
      const text: string[] = [standardName];
      if (input?.description) text.push(input.description);

      if (input?.applyStandards?.content) {
        const contentTypes = Object.keys(input.applyStandards.content).sort();

        contentTypes.forEach((content) => {
          text.push(`**${content}**`);
          text.push(input!.applyStandards!.content[content]!.toMarkdown());
        });
      }

      return text.join('\n');
    },
  };
}
