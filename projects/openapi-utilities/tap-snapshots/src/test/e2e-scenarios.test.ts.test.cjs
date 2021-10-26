/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/test/e2e-scenarios.test.ts TAP > must match snapshot 1`] = `
Array [
  Object {
    "added": Object {
      "maturity": "wip",
      "method": "get",
      "pathPattern": "/user/login",
      "summary": "Logs user into the system",
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
      ],
      "kind": "endpoint",
      "stableId": "loginUser",
    },
  },
  Object {
    "added": Object {
      "contentType": "application/xml",
      "schema": Object {
        "type": "string",
      },
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "200",
        "application/xml",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "200",
        "content",
        "application/xml",
        "body",
      ],
      "kind": "body",
    },
  },
  Object {
    "added": Object {
      "contentType": "application/json",
      "schema": Object {
        "type": "string",
      },
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
    },
  },
  Object {
    "added": Object {
      "statusCode": 200,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "200",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/login\\",\\"get\\",\\"responses\\",\\"200\\"]",
    },
  },
  Object {
    "added": Object {
      "statusCode": 400,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "400",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/login\\",\\"get\\",\\"responses\\",\\"400\\"]",
    },
  },
  Object {
    "added": Object {
      "maturity": "wip",
      "method": "get",
      "pathPattern": "/user/logout",
      "summary": "Logs out current logged in user session",
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/logout",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/user/logout",
        "get",
      ],
      "kind": "endpoint",
      "stableId": "logoutUser",
    },
  },
  Object {
    "added": Object {
      "statusCode": null,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/logout",
        "get",
        "responses",
        "default",
      ],
      "jsonPath": Array [
        "paths",
        "/user/logout",
        "get",
        "responses",
        "default",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/logout\\",\\"get\\",\\"responses\\",\\"default\\"]",
    },
  },
  Object {
    "added": Object {
      "maturity": "wip",
      "method": "get",
      "pathPattern": "/user/{username}",
      "summary": "Get user by user name",
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
      ],
      "kind": "endpoint",
      "stableId": "getUserByName",
    },
  },
  Object {
    "added": Object {
      "contentType": "application/xml",
      "schema": Object {
        "$$ref": "#/components/schemas/User",
        "properties": Object {
          "email": Object {
            "type": "string",
          },
          "firstName": Object {
            "type": "string",
          },
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "lastName": Object {
            "type": "string",
          },
          "password": Object {
            "type": "string",
          },
          "phone": Object {
            "type": "string",
          },
          "username": Object {
            "type": "string",
          },
          "userStatus": Object {
            "description": "User Status",
            "format": "int32",
            "type": "integer",
          },
        },
        "required": Array [
          "id",
          "username",
          "firstName",
          "lastName",
          "email",
          "password",
          "phone",
        ],
        "type": "object",
        "xml": Object {
          "name": "User",
        },
      },
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "content",
        "application/xml",
        "body",
      ],
      "kind": "body",
    },
  },
  Object {
    "added": Object {
      "contentType": "application/json",
      "schema": Object {
        "$$ref": "#/components/schemas/User",
        "properties": Object {
          "email": Object {
            "type": "string",
          },
          "firstName": Object {
            "type": "string",
          },
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "lastName": Object {
            "type": "string",
          },
          "password": Object {
            "type": "string",
          },
          "phone": Object {
            "type": "string",
          },
          "username": Object {
            "type": "string",
          },
          "userStatus": Object {
            "description": "User Status",
            "format": "int32",
            "type": "integer",
          },
        },
        "required": Array [
          "id",
          "username",
          "firstName",
          "lastName",
          "email",
          "password",
          "phone",
        ],
        "type": "object",
        "xml": Object {
          "name": "User",
        },
      },
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
    },
  },
  Object {
    "added": Object {
      "statusCode": 200,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "responses",
        "200",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"get\\",\\"responses\\",\\"200\\"]",
    },
  },
  Object {
    "added": Object {
      "statusCode": 400,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "responses",
        "400",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"get\\",\\"responses\\",\\"400\\"]",
    },
  },
  Object {
    "added": Object {
      "statusCode": 404,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "responses",
        "404",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"get\\",\\"responses\\",\\"404\\"]",
    },
  },
  Object {
    "added": Object {
      "maturity": "wip",
      "method": "patch",
      "pathPattern": "/user/{username}",
      "summary": "Updated user",
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "patch",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "patch",
      ],
      "kind": "endpoint",
      "stableId": "updateUser",
    },
  },
  Object {
    "added": Object {
      "statusCode": 400,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "patch",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "patch",
        "responses",
        "400",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"patch\\",\\"responses\\",\\"400\\"]",
    },
  },
  Object {
    "added": Object {
      "statusCode": 404,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "patch",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "patch",
        "responses",
        "404",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"patch\\",\\"responses\\",\\"404\\"]",
    },
  },
  Object {
    "added": Object {
      "maturity": "wip",
      "method": "delete",
      "pathPattern": "/user/{username}",
      "summary": "Delete user",
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "delete",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "delete",
      ],
      "kind": "endpoint",
      "stableId": "deleteUser",
    },
  },
  Object {
    "added": Object {
      "statusCode": 400,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "delete",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "delete",
        "responses",
        "400",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"delete\\",\\"responses\\",\\"400\\"]",
    },
  },
  Object {
    "added": Object {
      "statusCode": 404,
    },
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "delete",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "delete",
        "responses",
        "404",
      ],
      "kind": "response",
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"delete\\",\\"responses\\",\\"404\\"]",
    },
  },
]
`
