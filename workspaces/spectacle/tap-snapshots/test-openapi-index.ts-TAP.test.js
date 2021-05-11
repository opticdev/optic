/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict';
exports[
  `test/openapi/index.ts TAP generate OpenAPI 3.0.1 > must match snapshot 1`
] = `
Object {
  "info": Object {
    "title": "Optic Generated OpenAPI",
    "version": "1.0.0",
  },
  "openapi": "3.0.3",
  "paths": Object {
    "/user": Object {
      "get": Object {
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "properties": Object {
                    "name": Object {
                      "type": "string",
                    },
                  },
                  "required": Array [
                    "name",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "",
          },
        },
      },
      "post": Object {
        "requestBody": Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "properties": Object {
                  "address": Object {
                    "properties": Object {
                      "street": Object {
                        "type": "string",
                      },
                    },
                    "type": "object",
                  },
                  "age": Object {
                    "oneOf": Array [
                      Object {
                        "type": "string",
                      },
                      Object {
                        "type": "number",
                      },
                    ],
                  },
                  "name": Object {
                    "type": "string",
                  },
                },
                "required": Array [
                  "address",
                  "age",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "properties": Object {
                    "name": Object {
                      "type": "string",
                    },
                  },
                  "required": Array [
                    "name",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "",
          },
        },
      },
    },
  },
}
`;
