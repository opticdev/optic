/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict';
exports[
  `test/json-schema.ts TAP generate JSON schemas for arrays > must match snapshot 1`
] = `
Object {
  "items": Array [
    Object {
      "properties": Object {
        "arrayWithObject": Object {
          "type": "boolean",
        },
      },
      "required": Array [
        "arrayWithObject",
      ],
      "type": "object",
    },
  ],
  "type": "array",
}
`;

exports[
  `test/json-schema.ts TAP generate JSON schemas for arrays with multiple types > must match snapshot 1`
] = `
Object {
  "items": Array [
    Object {
      "type": "string",
    },
    Object {
      "type": "number",
    },
  ],
  "type": "array",
}
`;

exports[
  `test/json-schema.ts TAP generate JSON schemas for objects > must match snapshot 1`
] = `
Object {
  "properties": Object {
    "address": Object {
      "properties": Object {
        "street": Object {
          "type": "string",
        },
      },
      "required": Array [],
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
}
`;
