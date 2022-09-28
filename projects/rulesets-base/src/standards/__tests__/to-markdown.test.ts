import { HeaderParameter, QueryParameter } from '../parameter';
import { AssertSchema } from '../assertions/schema';
import { Operation } from '../operation';
import { AssertString } from '../assertions/string';
import { Response } from '../response';
import { Body } from '../body';

describe('standard to markdown', () => {
  describe('operation', () => {
    const operation = Operation('Post Operations', {
      when: (operation, context) => {
        return operation.method === 'post';
      },
      description: 'All our post operations ',
      applyStandards: {
        operationId: AssertString('must be set and formatted ie getResource'),
        tags: (tags, context) => {},
        parameters: [
          QueryParameter(
            'must include an idempotent ID so we do not double update',
            {
              applyStandards: {
                name: 'idempotent_id',
                required: true,
              },
            }
          ),
          HeaderParameter('must include a request ID for our tracing tools', {
            applyStandards: {
              name: 'request_id',
              required: true,
            },
          }),
        ],
        responses: {
          '201': Response('must have a 201', {
            applyStandards: {
              content: {
                'application/json': Body('json api post body', {
                  applyStandards: {
                    schema: AssertSchema('must use json api', {
                      type: 'object',
                      required: ['data'],
                      properties: {
                        data: {},
                      },
                    }),
                  },
                }),
              },
            },
          }),
          '400': Response('must have a 400'),
        },
      },
    });

    console.log(operation.toMarkdown());
  });

  describe('parameters', () => {
    it('query param to markdown', () => {
      const limitQueryParam = QueryParameter(
        '`limit` parameter provided on all resource collections',
        {
          applyStandards: {
            required: true,
            name: 'limit',
            schema: AssertSchema('must be a number', {
              type: 'number',
              minimum: 10,
              maximum: 100,
            }),
          },
        }
      );

      expect(limitQueryParam.toMarkdown()).toMatchSnapshot();
    });
  });
});
