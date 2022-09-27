import {
  OpenApiKind,
  OpenApiOperationFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { StandardBase } from './standard-base';
import { AssertString, StringAssertion } from './assertions/strings';
import {
  HeaderParameter,
  ParameterStandard,
  QueryParameter,
} from './parameter-standard';

type Context = OpenApiOperationFact;

interface OperationStandardInput {
  summary?: StringAssertion<OpenApiOperationFact>;
  tags?: (tags: OpenAPIV3.OperationObject['tags'], context: Context) => void;
  operationId?: StringAssertion<OpenApiOperationFact>;
  parameters?: ParameterStandard[];
}

function Operation(
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
    toMarkdown: () => ``,
  };
}

Operation('Post Operations', {
  when: (operation, context) => {
    return operation.method === 'post';
  },
  applyStandards: {
    summary: (summary) => {
      throw new Error();
    },
    operationId: AssertString('must be set and formatted ie getResource'),
    tags: (tags, context) => {},
    parameters: [
      QueryParameter(
        'post operations must include an idempotent ID so we do not double update',
        {
          applyStandards: {
            name: 'idempotent_id',
            required: true,
          },
        }
      ),
      HeaderParameter(
        'post operations must include a request ID for our tracing tools',
        {
          applyStandards: {
            name: 'request_id',
            required: true,
          },
        }
      ),
    ],
  },
});
