/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/test/basic-file-questions.test.ts TAP > must match snapshot 1`] = `
Array [
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/apps/{client_id}/orgs",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/apps/{client_id}/orgs",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "array",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/apps/{client_id}/orgs",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/examples/hello_world",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
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
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
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
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world/{id}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/examples/hello_world/{id}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/examples/hello_world/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/openapi",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/openapi",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/openapi",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/openapi",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/openapi",
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
        "/openapi/{version}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/openapi/{version}",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/openapi/{version}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/openapi/{version}",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/openapi/{version}",
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
        "/openapi/{version}",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/openapi/{version}",
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
        "/orgs/{org_id}/apps",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/orgs/{org_id}/apps",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "array",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/orgs/{org_id}/apps",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/apps",
        "post",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/invites",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/invites",
        "post",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/orgs/{org_id}/invites",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/invites",
        "post",
        "responses",
        "201",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/orgs/{org_id}/issues",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "array",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/orgs/{org_id}/issues/detail/code/{issue_id}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/issues/detail/code/{issue_id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/projects",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/orgs/{org_id}/projects",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "array",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "links",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/projects",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "links",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "delete",
      "pathPattern": "/orgs/{org_id}/targets/{target_id}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "409",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/targets/{target_id}",
        "delete",
        "responses",
        "409",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/users/{id}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/users/{id}",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/orgs/{org_id}/users/{id}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
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
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "data",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "data",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "application/vnd.api+json",
        "jsonapi",
      ],
      "jsonPath": Array [
        "paths",
        "/orgs/{org_id}/users/{id}",
        "get",
        "responses",
        "200",
        "content",
        "application/vnd.api+json",
        "body",
        "properties",
        "jsonapi",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": true,
      "schemaTypes": Array [
        "any",
      ],
    },
  },
]
`

exports[`src/test/basic-file-questions.test.ts TAP original contents > must match snapshot 1`] = `
Object {
  "components": Object {
    "headers": Object {
      "DeprecationHeader": Object {
        "description": String(
          A header containing the deprecation date of the underlying endpoint. For more information, please refer to the deprecation header RFC:
          https://tools.ietf.org/id/draft-dalal-deprecation-header-01.html
          
        ),
        "schema": Object {
          "format": "date-time",
          "type": "string",
        },
      },
      "InternalGlooNormalizedPathHeader": Object {
        "description": "An internal header used by Snyk's API-Gateway for analytics.\\n",
        "schema": Object {
          "type": "string",
        },
      },
      "InternalGlooOrgIdHeader": Object {
        "description": "An internal header used by Snyk's API-Gateway for analytics.\\n",
        "schema": Object {
          "format": "uuid",
          "type": "string",
        },
      },
      "RequestIdResponseHeader": Object {
        "description": "A header containing a unique id used for tracking this request. If you are reporting an issue to Snyk it's very helpful to provide this ID.\\n",
        "schema": Object {
          "format": "uuid",
          "type": "string",
        },
      },
      "SunsetHeader": Object {
        "description": String(
          A header containing the date of when the underlying endpoint will be removed. This header is only present if the endpoint has been deprecated. Please refer to the RFC for more information:
          https://datatracker.ietf.org/doc/html/rfc8594
          
        ),
        "schema": Object {
          "format": "date-time",
          "type": "string",
        },
      },
      "VersionRequestedResponseHeader": Object {
        "description": "A header containing the version of the endpoint requested by the caller.",
        "schema": Object {
          "$ref": "#/components/schemas/Version",
        },
      },
      "VersionServedResponseHeader": Object {
        "description": "A header containing the version of the endpoint that was served by the API.",
        "schema": Object {
          "$ref": "#/components/schemas/Version",
        },
      },
      "VersionStageResponseHeader": Object {
        "description": "A header containing the version stage of the endpoint. This stage describes the guarantees snyk provides surrounding stability of the endpoint.\\n",
        "schema": Object {
          "enum": Array [
            "wip",
            "experimental",
            "beta",
            "ga",
            "deprecated",
            "sunset",
          ],
          "type": "string",
        },
      },
    },
    "parameters": Object {
      "EndingBefore": Object {
        "description": "Return the page of results immediately before this cursor",
        "in": "query",
        "name": "ending_before",
        "schema": Object {
          "type": "string",
        },
      },
      "IssueSeverity": Object {
        "description": "Severity of issues to match",
        "in": "query",
        "name": "severity",
        "schema": Object {
          "$ref": "#/components/schemas/IssueSeverity",
        },
      },
      "IssueType": Object {
        "description": "Issue type(s) to match, comma-separated",
        "explode": false,
        "in": "query",
        "name": "type",
        "schema": Object {
          "items": Object {
            "$ref": "#/components/schemas/IssueType",
          },
          "type": "array",
        },
        "style": "form",
      },
      "Limit": Object {
        "description": "Number of results to return per page",
        "in": "query",
        "name": "limit",
        "schema": Object {
          "default": 10,
          "format": "int32",
          "maximum": 100,
          "minimum": 10,
          "multipleOf": 10,
          "type": "integer",
        },
      },
      "StartingAfter": Object {
        "description": "Return the page of results immediately after this cursor",
        "in": "query",
        "name": "starting_after",
        "schema": Object {
          "type": "string",
        },
      },
      "Version": Object {
        "description": "The requested version of the endpoint to process the request",
        "in": "query",
        "name": "version",
        "required": true,
        "schema": Object {
          "type": "string",
        },
      },
    },
    "responses": Object {
      "400": Object {
        "content": Object {
          "application/vnd.api+json": Object {
            "schema": Object {
              "$ref": "#/components/schemas/ErrorDocument",
            },
          },
        },
        "description": "Bad Request: A parameter provided as a part of the request was invalid.",
        "headers": Object {
          "deprecation": Object {
            "$ref": "#/components/headers/DeprecationHeader",
          },
          "snyk-request-id": Object {
            "$ref": "#/components/headers/RequestIdResponseHeader",
          },
          "snyk-version-lifecycle-stage": Object {
            "$ref": "#/components/headers/VersionStageResponseHeader",
          },
          "snyk-version-requested": Object {
            "$ref": "#/components/headers/VersionRequestedResponseHeader",
          },
          "snyk-version-served": Object {
            "$ref": "#/components/headers/VersionServedResponseHeader",
          },
          "sunset": Object {
            "$ref": "#/components/headers/SunsetHeader",
          },
        },
      },
      "401": Object {
        "content": Object {
          "application/vnd.api+json": Object {
            "schema": Object {
              "$ref": "#/components/schemas/ErrorDocument",
            },
          },
        },
        "description": "Unauthorized: the request requires an authentication token or a token with more permissions.",
        "headers": Object {
          "deprecation": Object {
            "$ref": "#/components/headers/DeprecationHeader",
          },
          "snyk-request-id": Object {
            "$ref": "#/components/headers/RequestIdResponseHeader",
          },
          "snyk-version-lifecycle-stage": Object {
            "$ref": "#/components/headers/VersionStageResponseHeader",
          },
          "snyk-version-requested": Object {
            "$ref": "#/components/headers/VersionRequestedResponseHeader",
          },
          "snyk-version-served": Object {
            "$ref": "#/components/headers/VersionServedResponseHeader",
          },
          "sunset": Object {
            "$ref": "#/components/headers/SunsetHeader",
          },
        },
      },
      "403": Object {
        "content": Object {
          "application/vnd.api+json": Object {
            "schema": Object {
              "$ref": "#/components/schemas/ErrorDocument",
            },
          },
        },
        "description": "Forbidden: The client does not have access rights to the content.",
        "headers": Object {
          "deprecation": Object {
            "$ref": "#/components/headers/DeprecationHeader",
          },
          "snyk-request-id": Object {
            "$ref": "#/components/headers/RequestIdResponseHeader",
          },
          "snyk-version-lifecycle-stage": Object {
            "$ref": "#/components/headers/VersionStageResponseHeader",
          },
          "snyk-version-requested": Object {
            "$ref": "#/components/headers/VersionRequestedResponseHeader",
          },
          "snyk-version-served": Object {
            "$ref": "#/components/headers/VersionServedResponseHeader",
          },
          "sunset": Object {
            "$ref": "#/components/headers/SunsetHeader",
          },
        },
      },
      "404": Object {
        "content": Object {
          "application/vnd.api+json": Object {
            "schema": Object {
              "$ref": "#/components/schemas/ErrorDocument",
            },
          },
        },
        "description": "Not Found: The resource being operated on could not be found.",
        "headers": Object {
          "deprecation": Object {
            "$ref": "#/components/headers/DeprecationHeader",
          },
          "snyk-request-id": Object {
            "$ref": "#/components/headers/RequestIdResponseHeader",
          },
          "snyk-version-lifecycle-stage": Object {
            "$ref": "#/components/headers/VersionStageResponseHeader",
          },
          "snyk-version-requested": Object {
            "$ref": "#/components/headers/VersionRequestedResponseHeader",
          },
          "snyk-version-served": Object {
            "$ref": "#/components/headers/VersionServedResponseHeader",
          },
          "sunset": Object {
            "$ref": "#/components/headers/SunsetHeader",
          },
        },
      },
      "500": Object {
        "content": Object {
          "application/vnd.api+json": Object {
            "schema": Object {
              "$ref": "#/components/schemas/ErrorDocument",
            },
          },
        },
        "description": "Internal Server Error: An error was encountered while attempting to process the request.",
        "headers": Object {
          "deprecation": Object {
            "$ref": "#/components/headers/DeprecationHeader",
          },
          "snyk-request-id": Object {
            "$ref": "#/components/headers/RequestIdResponseHeader",
          },
          "snyk-version-lifecycle-stage": Object {
            "$ref": "#/components/headers/VersionStageResponseHeader",
          },
          "snyk-version-requested": Object {
            "$ref": "#/components/headers/VersionRequestedResponseHeader",
          },
          "snyk-version-served": Object {
            "$ref": "#/components/headers/VersionServedResponseHeader",
          },
          "sunset": Object {
            "$ref": "#/components/headers/SunsetHeader",
          },
        },
      },
    },
    "schemas": Object {
      "App": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "$ref": "#/components/schemas/AppAttributes",
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "links": Object {
            "$ref": "#/components/schemas/Links",
          },
          "type": Object {
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "AppAttributes": Object {
        "properties": Object {
          "clientId": Object {
            "description": "The oauth2 client id for the app.",
            "format": "uuid",
            "type": "string",
          },
          "isPublic": Object {
            "description": "A boolean to indicate an app is publicly available.",
            "type": "boolean",
          },
          "name": Object {
            "description": "The name given to the app.",
            "type": "string",
          },
          "redirectUris": Object {
            "description": "The provided redirect URIs for the app.",
            "items": Object {
              "type": "string",
            },
            "type": "array",
          },
          "scopes": Object {
            "description": "The scopes this app is allowed to request during authorization.",
            "items": Object {
              "type": "string",
            },
            "type": "array",
          },
        },
        "required": Array [
          "name",
          "clientId",
          "redirectUris",
          "scopes",
          "isPublic",
        ],
        "type": "object",
      },
      "AppOrg": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "additionalProperties": false,
            "type": "object",
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "type": Object {
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
        ],
        "type": "object",
      },
      "AppWithSecret": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "allOf": Array [
              Object {
                "$ref": "#/components/schemas/AppAttributes",
              },
              Object {
                "properties": Object {
                  "clientSecret": Object {
                    "description": "The oauth2 client secret for the app. This is the only time this secret will be returned, store it securely and don't lose it.",
                    "type": "string",
                  },
                },
                "required": Array [
                  "clientSecret",
                ],
                "type": "object",
              },
            ],
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "links": Object {
            "$ref": "#/components/schemas/Links",
          },
          "type": Object {
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
          "links",
        ],
        "type": "object",
      },
      "CodeIssue": Object {
        "description": "An issue discovered by SAST code analysis",
        "properties": Object {
          "attributes": Object {
            "allOf": Array [
              Object {
                "$ref": "#/components/schemas/IssueSummaryAttributes",
              },
              Object {
                "properties": Object {
                  "fingerprint": Object {
                    "nullable": true,
                    "type": "string",
                  },
                  "fingerprintVersion": Object {
                    "nullable": true,
                    "type": "string",
                  },
                  "primaryRegion": Object {
                    "description": "SARIF code region object",
                    "type": "object",
                  },
                  "priorityScore": Object {
                    "type": "number",
                  },
                  "priorityScoreFactors": Object {
                    "description": "Descriptions of factors affecting priority score",
                    "items": Object {
                      "type": "string",
                    },
                    "type": "array",
                  },
                },
                "type": "object",
              },
            ],
          },
          "id": Object {
            "description": "Code public issue ID",
            "example": "ea536a06-0566-40ca-b96b-155568aa2027",
            "format": "uuid",
            "type": "string",
          },
          "type": Object {
            "description": "Content type",
            "example": "code-issue",
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "Error": Object {
        "additionalProperties": false,
        "properties": Object {
          "detail": Object {
            "type": "string",
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "meta": Object {
            "additionalProperties": true,
            "type": "object",
          },
          "source": Object {
            "additionalProperties": false,
            "properties": Object {
              "parameter": Object {
                "type": "string",
              },
              "pointer": Object {
                "type": "string",
              },
            },
            "type": "object",
          },
          "status": Object {
            "type": "string",
          },
        },
        "required": Array [
          "status",
          "detail",
        ],
        "type": "object",
      },
      "ErrorDocument": Object {
        "additionalProperties": false,
        "properties": Object {
          "errors": Object {
            "items": Object {
              "$ref": "#/components/schemas/Error",
            },
            "minItems": 1,
            "type": "array",
          },
          "jsonapi": Object {
            "$ref": "#/components/schemas/JsonApi",
          },
        },
        "required": Array [
          "jsonapi",
          "errors",
        ],
        "type": "object",
      },
      "HelloWorld": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "additionalProperties": false,
            "properties": Object {
              "betaField": Object {
                "type": "string",
              },
              "message": Object {
                "type": "string",
              },
              "requestSubject": Object {
                "additionalProperties": false,
                "properties": Object {
                  "clientId": Object {
                    "format": "uuid",
                    "type": "string",
                  },
                  "publicId": Object {
                    "format": "uuid",
                    "type": "string",
                  },
                  "type": Object {
                    "type": "string",
                  },
                },
                "required": Array [
                  "publicId",
                  "type",
                ],
                "type": "object",
              },
            },
            "required": Array [
              "message",
              "betaField",
              "requestSubject",
            ],
            "type": "object",
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "type": Object {
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "IssueSeverity": Object {
        "description": "Severity of an issue",
        "enum": Array [
          "low",
          "medium",
          "high",
          "critical",
        ],
        "type": "string",
      },
      "IssueSummary": Object {
        "description": "Summary description of an issue.",
        "properties": Object {
          "attributes": Object {
            "$ref": "#/components/schemas/IssueSummaryAttributes",
          },
          "id": Object {
            "description": "The Issue ID",
            "example": "2bcd80a9-e343-4601-9393-f820d51ab713",
            "format": "uuid",
            "type": "string",
          },
          "links": Object {
            "$ref": "#/components/schemas/Links",
          },
          "type": Object {
            "description": "Content type",
            "example": "issue-summary",
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
          "links",
        ],
        "type": "object",
      },
      "IssueSummaryAttributes": Object {
        "properties": Object {
          "ignored": Object {
            "description": "Whether the issue has been ignored",
            "type": "boolean",
          },
          "issueType": Object {
            "$ref": "#/components/schemas/IssueType",
          },
          "severity": Object {
            "$ref": "#/components/schemas/IssueSeverity",
          },
          "title": Object {
            "description": "The name of the issue",
            "type": "string",
          },
        },
        "required": Array [
          "issueType",
          "title",
          "severity",
          "ignored",
        ],
        "type": "object",
      },
      "IssueType": Object {
        "description": "Issue type. Implies the existence of a resource /issues/detail/{issue-type}/{id}.\\n",
        "enum": Array [
          "code",
        ],
        "type": "string",
      },
      "JsonApi": Object {
        "additionalProperties": false,
        "properties": Object {
          "version": Object {
            "type": "string",
          },
        },
        "required": Array [
          "version",
        ],
        "type": "object",
      },
      "LinkProperty": Object {
        "oneOf": Array [
          Object {
            "type": "string",
          },
          Object {
            "additionalProperties": false,
            "properties": Object {
              "href": Object {
                "type": "string",
              },
              "meta": Object {
                "additionalProperties": true,
                "type": "object",
              },
            },
            "required": Array [
              "href",
              "meta",
            ],
            "type": "object",
          },
        ],
      },
      "Links": Object {
        "additionalProperties": false,
        "properties": Object {
          "first": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
          "last": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
          "next": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
          "prev": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
          "related": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
          "self": Object {
            "$ref": "#/components/schemas/LinkProperty",
          },
        },
        "type": "object",
      },
      "OrgInvitation": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "$ref": "#/components/schemas/OrgInvitationAttributes",
          },
          "id": Object {
            "format": "uuid",
            "type": "string",
          },
          "type": Object {
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "OrgInvitationAttributes": Object {
        "additionalProperties": false,
        "properties": Object {
          "email": Object {
            "description": "The email address of the invitee.",
            "example": "example@email.com",
            "type": "string",
          },
          "isActive": Object {
            "description": "The active status of the invitation.",
            "type": "boolean",
          },
          "org": Object {
            "description": "The organization the invite was created for.",
            "example": "Example org",
            "type": "string",
          },
          "role": Object {
            "description": "The role assigned to the invitee on acceptance.",
            "example": "Developer",
            "type": "string",
          },
        },
        "required": Array [
          "email",
          "isActive",
          "role",
          "org",
        ],
        "type": "object",
      },
      "Project": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "additionalProperties": false,
            "properties": Object {
              "businessCriticality": Object {
                "items": Object {
                  "type": "string",
                },
                "type": "array",
              },
              "created": Object {
                "description": "The date that the project was created on",
                "example": "2021-05-29T09:50:54.014Z",
                "format": "date-time",
                "type": "string",
              },
              "environment": Object {
                "items": Object {
                  "type": "string",
                },
                "type": "array",
              },
              "hostname": Object {
                "description": "The hostname for a CLI project, null if not set",
                "nullable": true,
                "type": "string",
              },
              "lifecycle": Object {
                "items": Object {
                  "type": "string",
                },
                "type": "array",
              },
              "name": Object {
                "type": "string",
              },
              "origin": Object {
                "description": "The origin the project was added from",
                "example": "github",
                "type": "string",
              },
              "status": Object {
                "description": "Describes if a project is currently monitored or it is de-activated",
                "example": "active",
                "type": "string",
              },
              "tags": Object {
                "items": Object {
                  "$ref": "#/components/schemas/Tag",
                },
                "type": "array",
              },
              "targetReference": Object {
                "nullable": true,
                "type": "string",
              },
              "type": Object {
                "description": "The package manager of the project",
                "example": "maven",
                "type": "string",
              },
            },
            "required": Array [
              "name",
              "created",
              "origin",
              "type",
              "status",
            ],
            "type": "object",
          },
          "id": Object {
            "description": "The ID.",
            "example": "331ede0a-de94-456f-b788-166caeca58bf",
            "format": "uuid",
            "type": "string",
          },
          "relationships": Object {
            "$ref": "#/components/schemas/Relationships",
          },
          "type": Object {
            "description": "Content type.",
            "example": "projects",
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "Relationships": Object {
        "additionalProperties": Object {
          "properties": Object {
            "data": Object {
              "properties": Object {
                "id": Object {
                  "format": "uuid",
                  "type": "string",
                },
                "links": Object {
                  "$ref": "#/components/schemas/Links",
                },
                "type": Object {
                  "type": "string",
                },
              },
              "required": Array [
                "type",
                "id",
              ],
            },
          },
          "required": Array [
            "data",
          ],
          "type": "object",
        },
        "type": "object",
      },
      "Tag": Object {
        "additionalProperties": false,
        "properties": Object {
          "key": Object {
            "type": "string",
          },
          "value": Object {
            "type": "string",
          },
        },
        "required": Array [
          "key",
          "value",
        ],
        "type": "object",
      },
      "User": Object {
        "additionalProperties": false,
        "properties": Object {
          "attributes": Object {
            "additionalProperties": false,
            "properties": Object {
              "email": Object {
                "description": "The email of the user.",
                "example": "user@someorg.com",
                "type": "string",
              },
              "name": Object {
                "description": "The name of the user.",
                "example": "user",
                "type": "string",
              },
              "username": Object {
                "description": "The username of the user.",
                "example": "username",
                "type": "string",
              },
            },
            "type": "object",
          },
          "id": Object {
            "description": "The Snyk ID corresponding to this user",
            "example": "55a348e2-c3ad-4bbc-b40e-9b232d1f4121",
            "format": "uuid",
            "type": "string",
          },
          "type": Object {
            "description": "Content type.",
            "example": "user",
            "type": "string",
          },
        },
        "required": Array [
          "type",
          "id",
          "attributes",
        ],
        "type": "object",
      },
      "Version": Object {
        "pattern": "^(wip|work-in-progress|experimental|beta|(([0-9]{4})-([0-1][0-9]))-((3[01])|(0[1-9])|([12][0-9])))$",
        "type": "string",
      },
    },
  },
  "info": Object {
    "title": "Snyk API",
    "version": "v3",
  },
  "openapi": "3.0.3",
  "paths": Object {
    "/apps/{client_id}/orgs": Object {
      "get": Object {
        "description": "Get a list of organizations your installed App has been granted access to by the user.",
        "operationId": "getAppAccessOrgs",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
          Object {
            "description": "The oauth2 client id of your app.",
            "in": "path",
            "name": "client_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/StartingAfter",
          },
          Object {
            "$ref": "#/components/parameters/EndingBefore",
          },
          Object {
            "$ref": "#/components/parameters/Limit",
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "items": Object {
                        "$ref": "#/components/schemas/AppOrg",
                      },
                      "type": "array",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A list of organizations the app has been granted access to by the user.",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Apps",
        ],
      },
      "x-snyk-api-version": "2021-08-11~experimental",
    },
    "/examples/hello_world": Object {
      "post": Object {
        "description": "Create a single result from the hello_world example",
        "operationId": "helloWorldCreate",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "requestBody": Object {
          "content": Object {
            "application/vnd.api+json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "attributes": Object {
                    "additionalProperties": false,
                    "properties": Object {
                      "betaField": Object {
                        "type": "string",
                      },
                      "message": Object {
                        "type": "string",
                      },
                    },
                    "required": Array [
                      "message",
                      "betaField",
                    ],
                    "type": "object",
                  },
                },
                "required": Array [
                  "attributes",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": Object {
          "201": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/HelloWorld",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A hello world entity being requested is returned",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Examples",
        ],
      },
      "x-snyk-api-version": "2021-06-13~beta",
    },
    "/examples/hello_world/{id}": Object {
      "get": Object {
        "description": "Get a single result from the hello_world example",
        "operationId": "helloWorldGetOne",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
          Object {
            "$ref": "#/components/parameters/StartingAfter",
          },
          Object {
            "$ref": "#/components/parameters/EndingBefore",
          },
          Object {
            "$ref": "#/components/parameters/Limit",
          },
          Object {
            "description": "The id of the hello_world example entity to be retrieved.",
            "in": "path",
            "name": "id",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/HelloWorld",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A hello world entity being requested is returned",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Examples",
        ],
      },
      "x-snyk-api-version": "2021-06-13~beta",
    },
    "/openapi": Object {
      "get": Object {
        "description": "List available versions of OpenAPI specification",
        "operationId": "listAPIVersions",
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "items": Object {
                    "type": "string",
                  },
                  "type": "array",
                },
              },
            },
            "description": "List of available versions is returned",
            "headers": Object {
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "OpenAPI",
        ],
      },
    },
    "/openapi/{version}": Object {
      "get": Object {
        "description": "Get OpenAPI specification effective at version.",
        "operationId": "getAPIVersion",
        "parameters": Array [
          Object {
            "description": "The requested version of the API",
            "in": "path",
            "name": "version",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "type": "object",
                },
              },
            },
            "description": "OpenAPI specification matching requested version is returned",
            "headers": Object {
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "OpenAPI",
        ],
      },
    },
    "/orgs/{org_id}/apps": Object {
      "get": Object {
        "description": "Get a list of apps created by an organization.",
        "operationId": "getApps",
        "parameters": Array [
          Object {
            "description": "The ID of the org",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "items": Object {
                        "$ref": "#/components/schemas/App",
                      },
                      "type": "array",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A list of apps for this organization is being returned",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Apps",
        ],
      },
      "post": Object {
        "description": "Create a new app for an organization.",
        "operationId": "createApp",
        "parameters": Array [
          Object {
            "description": "The ID of the org which will be creating and owning the app",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "requestBody": Object {
          "content": Object {
            "application/vnd.api+json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "name": Object {
                    "description": "Name of the app to display to users during authorization.",
                    "type": "string",
                  },
                  "redirectUris": Object {
                    "description": "List of allowed redirect URIs to call back after authentication.",
                    "items": Object {
                      "type": "string",
                    },
                    "type": "array",
                  },
                  "scopes": Object {
                    "description": "The scopes this app is allowed to request during authorization.",
                    "items": Object {
                      "type": "string",
                    },
                    "type": "array",
                  },
                },
                "required": Array [
                  "name",
                  "redirectUris",
                  "scopes",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/AppWithSecret",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A new app has been created",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Apps",
        ],
      },
      "x-snyk-api-version": "2021-08-11~experimental",
    },
    "/orgs/{org_id}/invites": Object {
      "post": Object {
        "description": "Invite a user to an organization.",
        "operationId": "inviteUserToOrg",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
          Object {
            "description": "The id of the org the user is being invited to",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
        ],
        "requestBody": Object {
          "content": Object {
            "application/vnd.api+json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "email": Object {
                    "description": "The invitee email address.",
                    "type": "string",
                  },
                  "role": Object {
                    "description": "The role public ID that will be granted to to invitee on acceptance.",
                    "format": "uuid",
                    "type": "string",
                  },
                },
                "required": Array [
                  "email",
                  "role",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": Object {
          "201": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/OrgInvitation",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A new organization invitation has been created",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "403": Object {
            "$ref": "#/components/responses/403",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Invites",
        ],
      },
      "x-snyk-api-version": "2021-09-15~experimental",
    },
    "/orgs/{org_id}/issues": Object {
      "get": Object {
        "description": "Get a summary of issues on a project or snapshot. Supports pagination, filtering by severity and issue type. One of ProjectID or SnapshotID must be specified.\\n",
        "operationId": "getIssuesSummary",
        "parameters": Array [
          Object {
            "description": "The id of the org to return a list of projects",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "description": "Project ID",
            "in": "query",
            "name": "project_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/IssueSeverity",
          },
          Object {
            "$ref": "#/components/parameters/IssueType",
          },
          Object {
            "$ref": "#/components/parameters/StartingAfter",
          },
          Object {
            "$ref": "#/components/parameters/EndingBefore",
          },
          Object {
            "$ref": "#/components/parameters/Limit",
          },
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "properties": Object {
                    "data": Object {
                      "items": Object {
                        "$ref": "#/components/schemas/IssueSummary",
                      },
                      "type": "array",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "List of matching issue summaries is returned",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "403": Object {
            "$ref": "#/components/responses/403",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Issue Summaries",
        ],
      },
      "x-snyk-api-version": "2021-08-13~experimental",
    },
    "/orgs/{org_id}/issues/detail/code/{issue_id}": Object {
      "get": Object {
        "description": "Get a Code issue",
        "operationId": "getCodeIssue",
        "parameters": Array [
          Object {
            "description": "The ID of the org",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "description": "Code issue ID",
            "in": "path",
            "name": "issue_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "description": "ID of the project which contains the issue",
            "in": "query",
            "name": "project_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/CodeIssue",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "Code issue is returned",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "403": Object {
            "$ref": "#/components/responses/403",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Code Issues",
        ],
      },
      "x-snyk-api-version": "2021-08-13~experimental",
    },
    "/orgs/{org_id}/projects": Object {
      "get": Object {
        "description": "Get a list of an organization's projects.",
        "operationId": "getOrgsProjects",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
          Object {
            "$ref": "#/components/parameters/StartingAfter",
          },
          Object {
            "$ref": "#/components/parameters/EndingBefore",
          },
          Object {
            "$ref": "#/components/parameters/Limit",
          },
          Object {
            "description": "The id of the org to return a list of projects",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
          Object {
            "description": "Return projects that prefix-match the provided name",
            "in": "query",
            "name": "name",
            "schema": Object {
              "type": "string",
            },
          },
          Object {
            "description": "Return projects that match the provided origin",
            "in": "query",
            "name": "origin",
            "schema": Object {
              "type": "string",
            },
          },
          Object {
            "description": "Return projects that match the provided type",
            "in": "query",
            "name": "type",
            "schema": Object {
              "type": "string",
            },
          },
          Object {
            "description": "Return projects that match the provided status",
            "in": "query",
            "name": "status",
            "schema": Object {
              "enum": Array [
                "active",
                "inactive",
              ],
              "type": "string",
            },
          },
          Object {
            "description": "Return projects that match all provided tags",
            "explode": false,
            "in": "query",
            "name": "tags",
            "schema": Object {
              "items": Object {
                "pattern": "^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$",
                "type": "string",
              },
              "type": "array",
            },
            "style": "form",
          },
          Object {
            "description": "Return projects that have at least 1 option",
            "explode": false,
            "in": "query",
            "name": "businessCriticality",
            "schema": Object {
              "items": Object {
                "enum": Array [
                  "critical",
                  "high",
                  "medium",
                  "low",
                ],
                "type": "string",
              },
              "type": "array",
            },
            "style": "form",
          },
          Object {
            "description": "Return projects that have at least 1 option",
            "explode": false,
            "in": "query",
            "name": "environment",
            "schema": Object {
              "items": Object {
                "enum": Array [
                  "frontend",
                  "backend",
                  "internal",
                  "external",
                  "mobile",
                  "saas",
                  "onprem",
                  "hosted",
                  "distributed",
                ],
                "type": "string",
              },
              "type": "array",
            },
            "style": "form",
          },
          Object {
            "description": "Return projects that have at least 1 option",
            "explode": false,
            "in": "query",
            "name": "lifecycle",
            "schema": Object {
              "items": Object {
                "enum": Array [
                  "production",
                  "development",
                  "sandbox",
                ],
                "type": "string",
              },
              "type": "array",
            },
            "style": "form",
          },
          Object {
            "description": "Return projects that belong to the provided target",
            "in": "query",
            "name": "targetId",
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "data": Object {
                      "items": Object {
                        "$ref": "#/components/schemas/Project",
                      },
                      "type": "array",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                    "links": Object {
                      "$ref": "#/components/schemas/Links",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                    "links",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "A list of projects is returned for the targeted org",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "403": Object {
            "$ref": "#/components/responses/403",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Projects",
        ],
      },
      "x-snyk-api-version": "2021-06-04~beta",
    },
    "/orgs/{org_id}/targets/{target_id}": Object {
      "delete": Object {
        "description": "Delete the specified target. Will fail if the target has any projects.",
        "operationId": "deleteOrgsTarget",
        "parameters": Array [
          Object {
            "$ref": "#/components/parameters/Version",
          },
          Object {
            "description": "The id of the org to return the target from",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "description": "The id of the target to return",
            "in": "path",
            "name": "target_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "The target is deleted if it is found in the specified org and has no projects",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "409": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "$ref": "#/components/schemas/ErrorDocument",
                },
              },
            },
            "description": "Unprocessable Entity: The target cannot be deleted as it has projects.",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Targets",
        ],
      },
      "x-snyk-api-version": "2021-09-29~beta",
    },
    "/orgs/{org_id}/users/{id}": Object {
      "get": Object {
        "description": "Get a summary of user.\\n",
        "operationId": "getUser",
        "parameters": Array [
          Object {
            "description": "The id of the org",
            "in": "path",
            "name": "org_id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "description": "The id of the user",
            "in": "path",
            "name": "id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
          Object {
            "$ref": "#/components/parameters/Version",
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/vnd.api+json": Object {
                "schema": Object {
                  "properties": Object {
                    "data": Object {
                      "$ref": "#/components/schemas/User",
                    },
                    "jsonapi": Object {
                      "$ref": "#/components/schemas/JsonApi",
                    },
                  },
                  "required": Array [
                    "jsonapi",
                    "data",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "User details",
            "headers": Object {
              "deprecation": Object {
                "$ref": "#/components/headers/DeprecationHeader",
              },
              "snyk-request-id": Object {
                "$ref": "#/components/headers/RequestIdResponseHeader",
              },
              "snyk-version-lifecycle-stage": Object {
                "$ref": "#/components/headers/VersionStageResponseHeader",
              },
              "snyk-version-requested": Object {
                "$ref": "#/components/headers/VersionRequestedResponseHeader",
              },
              "snyk-version-served": Object {
                "$ref": "#/components/headers/VersionServedResponseHeader",
              },
              "sunset": Object {
                "$ref": "#/components/headers/SunsetHeader",
              },
              "x-envoy-to-remove-normalized-request-path": Object {
                "$ref": "#/components/headers/InternalGlooNormalizedPathHeader",
              },
              "x-envoy-to-remove-org-public-id": Object {
                "$ref": "#/components/headers/InternalGlooOrgIdHeader",
              },
            },
          },
          "400": Object {
            "$ref": "#/components/responses/400",
          },
          "401": Object {
            "$ref": "#/components/responses/401",
          },
          "403": Object {
            "$ref": "#/components/responses/403",
          },
          "404": Object {
            "$ref": "#/components/responses/404",
          },
          "500": Object {
            "$ref": "#/components/responses/500",
          },
        },
        "tags": Array [
          "Users",
        ],
      },
      "x-snyk-api-version": "2021-09-13~beta",
    },
  },
  "servers": Array [
    Object {
      "description": "Public Snyk API",
      "url": "http://api.snyk.local/v3",
    },
    Object {
      "description": "ExpressJS validation routes",
      "url": "/api/v3",
    },
  ],
  "tags": Array [
    Object {
      "description": "Third-party Apps that integrate with the Snyk platform. See our [overview documentation](https://docs.snyk.io/integrations/snyk-apps) for more details.",
      "name": "Apps",
    },
    Object {
      "description": "Snyk Code issues discovered in projects",
      "name": "Code Issues",
    },
    Object {
      "description": "An example of a v3 API resource",
      "name": "Examples",
    },
    Object {
      "description": "Organization Invites.",
      "name": "Invites",
    },
    Object {
      "description": "Summary-level information of issues found in projects.",
      "name": "Issue Summaries",
    },
    Object {
      "description": "The OpenAPI specification for this service.",
      "name": "OpenAPI",
    },
    Object {
      "description": "Projects scanned by Snyk.",
      "name": "Projects",
    },
    Object {
      "description": "Targets are the resources tested by Snyk",
      "name": "Targets",
    },
    Object {
      "description": "Snyk Users",
      "name": "Users",
    },
  ],
}
`
