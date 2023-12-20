import { test, expect } from '@jest/globals';
import { prepareOperation, prepareResponse } from '../prepare-openapi';

test('can reduce size of operations by removing nested schemas ', () => {
  const output = prepareOperation({
    description: 'delete all the orders for this user',
    parameters: [
      {
        name: 'a',
        in: 'query',
        description: '123',
        example: '123',
      },
    ],
    requestBody: {
      description: 'what to send',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
              },
              orders: {
                type: 'array',
                description: 'item-ids',
                example: ['1', '2', '3'],
                items: {
                  type: 'string',
                  description: 'itemIds',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'The response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Delete me',
                },
              },
            },
          },
        },
      },
    },
  });
  expect(output).toMatchSnapshot();
});

test('can reduce size of responses by deleting descriptions + examples ', () => {
  const output = prepareResponse({
    description: 'The response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Delete me',
            },
            example: {
              type: 'string',
              example: '123',
            },
          },
        },
      },
    },
  });
  expect(output).toMatchSnapshot();
});
