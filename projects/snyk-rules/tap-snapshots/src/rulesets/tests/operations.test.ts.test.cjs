/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/rulesets/tests/operations.test.ts TAP > invalid operation ID case should fail 1`] = `
Array [
  Object {
    "condition": "have the correct operationId format",
    "error": "expected false to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > invalid operation ID prefix should fail 1`] = `
Array [
  Object {
    "condition": "have the correct operationId format",
    "error": "expected false to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > missing id should fail 1`] = `
Array [
  Object {
    "condition": "have the correct operationId format",
    "error": "expected undefined to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > must match snapshot 1`] = `
Object {
  "base": String(
    {
       "info": {
          "title": "Empty",
          "version": "0.0.0"
       },
       "openapi": "3.0.1",
       "paths": {
          "/example": {
             "get": {
                "responses": {
                }
             }
          }
       }
    }
  ),
  "changelog": Array [
    Object {
      "changed": Object {
        "after": Object {
          "method": "get",
          "operationId": "",
          "pathPattern": "/example",
        },
        "before": Object {
          "method": "get",
          "pathPattern": "/example",
        },
      },
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
        "location": "inRequest",
      },
    },
  ],
  "next": String(
    {
       "info": {
          "title": "Empty",
          "version": "0.0.0"
       },
       "openapi": "3.0.1",
       "paths": {
          "/example": {
             "get": {
                "operationId": "",
                "responses": {
                }
             }
          }
       }
    }
  ),
  "results": Array [
    Object {
      "condition": "have the correct operationId format",
      "error": "expected '' to be truthy",
      "isMust": true,
      "isShould": false,
      "passed": false,
      "where": "operation: get /example",
    },
  ],
}
`

exports[`src/rulesets/tests/operations.test.ts TAP > valid operation ID prefix should pass 1`] = `
Array [
  Object {
    "condition": "have the correct operationId format",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > with summary should pass 1`] = `
Array [
  Object {
    "condition": "have a summary",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > with tags should pass 1`] = `
Array [
  Object {
    "condition": "have tags",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > without summary should fail 1`] = `
Array [
  Object {
    "condition": "have a summary",
    "error": "expected undefined to exist",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > without tags should fail 1`] = `
Array [
  Object {
    "condition": "have tags",
    "error": "Target cannot be null or undefined.",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`
