/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/test/pairing.test.ts TAP nested requires > must match snapshot 1`] = `
Array [
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/example",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/example",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/example",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/example",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/example",
        "get",
        "responses",
        "200",
        "application/json",
        "s",
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
        "properties",
        "s",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "string",
      ],
    },
  },
]
`

exports[`src/test/pairing.test.ts TAP nested requires > must match snapshot 2`] = `
Array [
  Object {
    "changed": Object {
      "after": Object {
        "required": false,
        "schemaTypes": Array [
          "boolean",
        ],
      },
      "before": Object {
        "required": false,
        "schemaTypes": Array [
          "string",
        ],
      },
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/example",
        "get",
        "responses",
        "200",
        "application/json",
        "s",
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
        "properties",
        "s",
      ],
      "kind": "field",
    },
  },
]
`
