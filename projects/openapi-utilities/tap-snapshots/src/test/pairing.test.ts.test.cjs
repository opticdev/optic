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
      "kind": "operation",
      "location": Object {
        "method": "get",
        "path": "/example",
      },
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
      "location": Object {
        "inResponse": Object {
          "body": Object {
            "contentType": "application/json",
          },
          "statusCode": "200",
        },
        "method": "get",
        "path": "/example",
      },
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "type": "object",
      },
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
      "location": Object {
        "inResponse": Object {
          "body": Object {
            "contentType": "application/json",
          },
          "statusCode": "200",
        },
        "jsonSchemaTrail": Array [
          "s",
        ],
        "method": "get",
        "path": "/example",
      },
    },
    "value": Object {
      "flatSchema": Object {
        "type": "string",
      },
      "key": "s",
      "required": false,
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
      ],
      "jsonPath": Array [
        "paths",
        "/example",
        "get",
        "responses",
        "200",
      ],
      "kind": "response",
      "location": Object {
        "inResponse": Object {
          "statusCode": "200",
        },
        "method": "get",
        "path": "/example",
      },
    },
    "value": Object {
      "description": "d",
      "statusCode": 200,
    },
  },
]
`

exports[`src/test/pairing.test.ts TAP nested requires > must match snapshot 2`] = `
Array [
  Object {
    "changed": Object {
      "after": Object {
        "flatSchema": Object {
          "type": "boolean",
        },
        "key": "s",
        "required": false,
      },
      "before": Object {
        "flatSchema": Object {
          "type": "string",
        },
        "key": "s",
        "required": false,
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
      "location": Object {
        "inResponse": Object {
          "body": Object {
            "contentType": "application/json",
          },
          "statusCode": "200",
        },
        "jsonSchemaTrail": Array [
          "s",
        ],
        "method": "get",
        "path": "/example",
      },
    },
  },
]
`
