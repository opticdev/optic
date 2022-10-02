import { ApiStandards } from '../standard';
import { changed, requirement } from '../attribute/assertions';
import { OpenApiStandard } from '../open-api-standard';
import {
  factsToChangelog,
  OpenAPITraverser,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { applyStandards } from '../runner/runner';
import { Paths } from '../entity/path-rules';

const sharedStyle: OpenApiStandard = {
  paths: {
    [Paths.filter((url) => url.startsWith('/example'))]: {
      '*': {
        parameters: [
          { in: 'query', name: requirement('must be camelCase', (name) => {}) },
        ],
        operationId: [
          requirement('be this format', (value) => {
            throw new Error('not the right format');
          }),
          changed('operation ids can not change once set', (before, after) => {
            if (before !== after)
              throw new Error('operation id can not change');
          }),
        ],
      },
    },
  },
};

const standards: ApiStandards = {
  styleGuides: {
    onAdded: [],
    always: [sharedStyle],
  },
};

const openApiExampleBefore: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    version: '',
    title: '',
  },
  paths: {
    '/example': {
      get: {
        operationId: 'abc',
        summary: '',
        responses: {},
      },
      post: {
        summary: '',
        responses: {},
      },
    },
    '/example/{id}': {
      post: {
        summary: '',
        responses: {},
      },
    },
  },
};

const openApiExampleAfter: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    version: '',
    title: '',
  },
  paths: {
    '/example': {
      get: {
        operationId: 'abc123',
        summary: '',
        responses: {},
      },
      post: {
        summary: '',
        responses: {},
      },
    },
    '/example/{id}': {
      post: {
        summary: '',
        responses: {},
      },
    },
  },
};

it('qualifies standards and operations', () => {
  const beforeTraverser = new OpenAPITraverser();
  beforeTraverser.traverse(openApiExampleBefore);

  const afterTraverser = new OpenAPITraverser();
  afterTraverser.traverse(openApiExampleAfter);

  const beforeFacts = Array.from(beforeTraverser.facts());
  const afterFacts = Array.from(afterTraverser.facts());
  const changes = factsToChangelog(beforeFacts, afterFacts);
  applyStandards(standards, beforeFacts, afterFacts, changes);
});
