import { describe, expect, it } from '@jest/globals';
import { jsonIterator } from './json-iterator';

it('iterates json with valid json path', () => {
  const iterator = jsonIterator({
    openapi: '3.0.0',
    paths: {
      '/': {
        get: {
          operationId: 'abc',
          responses: {
            '200': {},
          },
        },
      },
    },
  });

  const results: any = [];
  for (const result of iterator) {
    results.push(result);
  }

  expect(results).toMatchInlineSnapshot(`
    [
      {
        "pointer": "/openapi",
        "value": "3.0.0",
      },
      {
        "pointer": "/paths/~1/get/operationId",
        "value": "abc",
      },
      {
        "pointer": "/paths/~1/get/responses/200",
        "value": {},
      },
      {
        "pointer": "/paths/~1/get/responses",
        "value": {
          "200": {},
        },
      },
      {
        "pointer": "/paths/~1/get",
        "value": {
          "operationId": "abc",
          "responses": {
            "200": {},
          },
        },
      },
      {
        "pointer": "/paths/~1",
        "value": {
          "get": {
            "operationId": "abc",
            "responses": {
              "200": {},
            },
          },
        },
      },
      {
        "pointer": "/paths",
        "value": {
          "/": {
            "get": {
              "operationId": "abc",
              "responses": {
                "200": {},
              },
            },
          },
        },
      },
      {
        "pointer": "",
        "value": {
          "openapi": "3.0.0",
          "paths": {
            "/": {
              "get": {
                "operationId": "abc",
                "responses": {
                  "200": {},
                },
              },
            },
          },
        },
      },
    ]
  `);
});
