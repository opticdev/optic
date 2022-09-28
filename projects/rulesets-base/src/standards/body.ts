import {
  OpenApiBodyFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { SchemaAssertion, SchemaAssertionMarkdown } from './assertions/schema';
import { bullets } from './markdown/util';

type Context = OpenApiBodyFact;

interface BodyStandardInput<AdditionalContext = {}> {
  schema?: SchemaAssertion<Context & AdditionalContext>;
  example?: (example: any, context: Context & AdditionalContext) => void;
  examples?: (
    examples: { [key: string]: any },
    context: Context & AdditionalContext
  ) => void;
}

export type BodyStandard = StandardBase & {
  kind: OpenApiKind.Body;
};

export function Body(
  standardName: string,
  input?: {
    when?: (
      body: OpenApiBodyFact,
      context: {
        raw: OpenAPIV3.OperationObject;
        operation: OpenApiOperationFact;
      }
    ) => boolean;
    applyStandards?: BodyStandardInput;
    description?: string;
    docsLinks?: string;
  }
): BodyStandard {
  return {
    kind: OpenApiKind.Body,
    toRules: () => {
      return [];
    },
    toMarkdown: () => {
      return `${bullets(
        SchemaAssertionMarkdown('schema', input?.applyStandards?.schema)
        // @todo add example rules
      )}`;
    },
  };
}
