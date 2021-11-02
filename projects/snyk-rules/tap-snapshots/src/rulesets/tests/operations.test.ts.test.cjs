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
    "condition": "have an operationId",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have a correct operationId prefix",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have camel case operationId prefix",
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
    "condition": "have an operationId",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have a correct operationId prefix",
    "error": "expected false to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have camel case operationId prefix",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > missing id should fail 1`] = `
Array [
  Object {
    "condition": "have an operationId",
    "error": "expected undefined to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have a correct operationId prefix",
    "error": "expected false to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have camel case operationId prefix",
    "error": "expected false to be truthy",
    "isMust": true,
    "isShould": false,
    "passed": false,
    "where": "operation: get /example",
  },
]
`

exports[`src/rulesets/tests/operations.test.ts TAP > valid operation ID prefix should pass 1`] = `
Array [
  Object {
    "condition": "have an operationId",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have a correct operationId prefix",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
  Object {
    "condition": "have camel case operationId prefix",
    "isMust": true,
    "isShould": false,
    "passed": true,
    "where": "operation: get /example",
  },
]
`
