import { rules } from '../properties';

import { createTestFixture } from './fixtures';

const { compare } = createTestFixture();

describe('body properties', () => {
  const baseOpenAPI = {
    openapi: '3.0.1',
    paths: {
      '/example': {
        get: {
          responses: {},
        },
      },
    },
    info: { version: '0.0.0', title: 'Empty' },
  };
  describe('breaking changes', () => {
    it('fails if a property is removed', async () => {
      const base = JSON.parse(JSON.stringify(baseOpenAPI));
      base.paths!['/example']!.get!.responses = {
        '200': {
          description: '',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      };
      const result = await compare(base)
        .to((spec) => {
          spec.paths!['/example']!.get!.responses = {
            '200': {
              description: '',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.preventRemoval, {});

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
    it('fails if a required property is added', async () => {
      const base = JSON.parse(JSON.stringify(baseOpenAPI));
      base.paths!['/example']!.get!.requestBody = {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {},
            },
          },
        },
      };
      const result = await compare(base)
        .to((spec) => {
          spec.paths!['/example']!.get!.requestBody = {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'number' },
                  },
                  required: ['count'],
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.preventAddingRequiredRequestProperties, {});

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });
});
