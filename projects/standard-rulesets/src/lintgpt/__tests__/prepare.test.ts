import { test, expect } from '@jest/globals';
import {
  removeDocumentationFromOperation,
  removeDocumentationFromResponses,
} from '../prepare-openapi';

test('can reduce size of operations by deleting descriptions + examples ', () => {
  const output = removeDocumentationFromOperation({
    description: 'delete all the orders for this user',
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
  const output = removeDocumentationFromResponses({
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
