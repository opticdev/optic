import { PathRules, Paths } from './entity/path-rules';
import {
  AttributeAssertions,
  changed,
  requirement,
} from './attribute/assertions';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

/*
Standards interfaces
 */

export interface OpenApiStandard {
  paths?: {
    [pathMatcher: PathRules]: {
      '*'?: OperationStandard;
      get?: OperationStandard;
      post?: OperationStandard;
      put?: OperationStandard;
      delete?: OperationStandard;
      path?: OperationStandard;
    };
  };
}

export interface OperationStandard {
  summary?: AttributeAssertions<string | undefined, {}>;
  operationId?: AttributeAssertions<string | undefined, {}>;
  tags?: AttributeAssertions<OpenAPIV3.OperationObject['tags'] | undefined, {}>;
  parameters?: ParametersStandard[];
  // extension attributes could be supported this way
  // [x: `x-${string}`]: AttributeAssertions<unknown | undefined, {}>;
}

type UnionParameterKinds = 'query' | 'path' | 'cookie' | 'header';

interface ParametersStandard {
  name?: string | AttributeAssertions<string | undefined, {}>;
  in?: UnionParameterKinds;
  required?: AttributeAssertions<boolean | undefined, {}>;
  style?: AttributeAssertions<
    OpenAPIV3.ParameterObject['style'] | undefined,
    {}
  >;
  explode?: AttributeAssertions<
    OpenAPIV3.ParameterObject['explode'] | undefined,
    {}
  >;
  example?: AttributeAssertions<
    OpenAPIV3.ParameterObject['example'] | undefined,
    {}
  >;
  examples?: AttributeAssertions<
    OpenAPIV3.ParameterObject['examples'] | undefined,
    {}
  >;
}

const a: OpenApiStandard = {
  paths: {
    '*': {
      '*': {
        parameters: [
          { in: 'query', name: requirement('must be camelCase', (name) => {}) },
        ],
        operationId: [
          requirement('be this format'),
          changed('operation ids can not change once set', (before, after) => {
            if (before !== after)
              throw new Error('operation id can not change');
          }),
        ],
        tags: requirement('must have at least one tag', (tags) => {}),

        // parmeters: [
        //   "in": 'query',
        //   name: 'request_id',
        //   schema: [requirement('matches', () => {})]
        // ],
        // responses: {
        //   '200': {
        //     content:
        //       "application/json": {
        //         schema:
        //       }
        //   }
        // },
      },
    },
  },
};
// const b: OpenApiStandard = {
//   paths: {
//     [Paths.filter((predicate) => {
//       return true;
//     })]: {},
//   },
// };

/*

Constructors

 */
