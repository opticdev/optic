/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/openapi3/implementations/openapi3/openapi-traverser.test.ts TAP > must match snapshot 1`] = `
Array [
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{}/uploadImage",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "post",
      "operationId": "uploadFile",
      "pathPattern": "/pet/{petId}/uploadImage",
      "requestBody": Object {
        "content": Object {
          "multipart/form-data": Object {
            "schema": Object {
              "properties": Object {
                "additionalMetadata": Object {
                  "description": "Additional data to pass to server",
                  "type": "string",
                },
                "file": Object {
                  "description": "file to upload",
                  "format": "binary",
                  "type": "string",
                },
              },
            },
          },
        },
      },
      "security": Array [
        Object {
          "petstore_auth": Array [
            "write:pets",
            "read:pets",
          ],
        },
      ],
      "summary": "uploads an image",
      "tags": Array [
        "pet",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{}/uploadImage",
        "post",
        "parameters",
        "path",
        "petId",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "ID of pet to update",
      "in": "path",
      "name": "petId",
      "required": true,
      "schema": Object {
        "format": "int64",
        "type": "integer",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{}/uploadImage",
        "post",
        "multipart/form-data",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
        "content",
        "multipart/form-data",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "multipart/form-data",
      "flatSchema": Object {},
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{}/uploadImage",
        "post",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "$ref": "#/components/schemas/ApiResponse",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{}/uploadImage",
        "post",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
        "responses",
        "200",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/inventory",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/store/inventory",
        "get",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "Returns a map of status codes to quantities",
      "method": "get",
      "operationId": "getInventory",
      "pathPattern": "/store/inventory",
      "security": Array [
        Object {
          "api_key": Array [],
        },
      ],
      "summary": "Returns pet inventories by status",
      "tags": Array [
        "store",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/inventory",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/store/inventory",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "additionalProperties": Object {
          "format": "int32",
          "type": "integer",
        },
        "type": "object",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/inventory",
        "get",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/store/inventory",
        "get",
        "responses",
        "200",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "post",
      "operationId": "placeOrder",
      "pathPattern": "/store/order",
      "requestBody": Object {
        "content": Object {
          "*/*": Object {
            "schema": Object {
              "$ref": "#/components/schemas/Order",
            },
          },
        },
        "description": "order placed for purchasing the pet",
        "required": true,
      },
      "summary": "Place an order for a pet",
      "tags": Array [
        "store",
      ],
      "x-codegen-request-body-name": "body",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "*/*",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
        "content",
        "*/*",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "*/*",
      "flatSchema": Object {
        "$ref": "#/components/schemas/Order",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/xml",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
        "responses",
        "200",
        "content",
        "application/xml",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/xml",
      "flatSchema": Object {
        "$ref": "#/components/schemas/Order",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "$ref": "#/components/schemas/Order",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
        "responses",
        "200",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order",
        "post",
        "responses",
        "400",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid Order",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions",
      "method": "get",
      "operationId": "getOrderById",
      "pathPattern": "/store/order/{orderId}",
      "summary": "Find purchase order by ID",
      "tags": Array [
        "store",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "parameters",
        "path",
        "orderId",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "ID of pet that needs to be fetched",
      "in": "path",
      "name": "orderId",
      "required": true,
      "schema": Object {
        "format": "int64",
        "maximum": 10,
        "minimum": 1,
        "type": "integer",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "responses",
        "200",
        "application/xml",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "content",
        "application/xml",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/xml",
      "flatSchema": Object {
        "$ref": "#/components/schemas/Order",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "responses",
        "200",
        "application/json",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "content",
        "application/json",
        "body",
      ],
      "kind": "body",
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "$ref": "#/components/schemas/Order",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "responses",
        "200",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "responses",
        "400",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid ID supplied",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "get",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
        "responses",
        "404",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Order not found",
      "statusCode": 404,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "delete",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "delete",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors",
      "method": "delete",
      "operationId": "deleteOrder",
      "pathPattern": "/store/order/{orderId}",
      "summary": "Delete purchase order by ID",
      "tags": Array [
        "store",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "delete",
        "parameters",
        "path",
        "orderId",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "delete",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "ID of the order that needs to be deleted",
      "in": "path",
      "name": "orderId",
      "required": true,
      "schema": Object {
        "format": "int64",
        "minimum": 1,
        "type": "integer",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "delete",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "delete",
        "responses",
        "400",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid ID supplied",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{}",
        "delete",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "delete",
        "responses",
        "404",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Order not found",
      "statusCode": 404,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/user",
        "post",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "This can only be done by the logged in user.",
      "method": "post",
      "operationId": "createUser",
      "pathPattern": "/user",
      "requestBody": Object {
        "content": Object {
          "*/*": Object {
            "schema": Object {
              "$ref": "#/components/schemas/User",
            },
          },
        },
        "description": "Created user object",
        "required": true,
      },
      "summary": "Create user",
      "tags": Array [
        "user",
      ],
      "x-codegen-request-body-name": "body",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user",
        "post",
        "*/*",
      ],
      "jsonPath": Array [
        "paths",
        "/user",
        "post",
        "content",
        "*/*",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "*/*",
      "flatSchema": Object {
        "$ref": "#/components/schemas/User",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user",
        "post",
        "responses",
        "default",
      ],
      "jsonPath": Array [
        "paths",
        "/user",
        "post",
        "responses",
        "default",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": null,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithArray",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithArray",
        "post",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "post",
      "operationId": "createUsersWithArrayInput",
      "pathPattern": "/user/createWithArray",
      "requestBody": Object {
        "content": Object {
          "*/*": Object {
            "schema": Object {
              "items": Object {
                "$ref": "#/components/schemas/User",
              },
              "type": "array",
            },
          },
        },
        "description": "List of user object",
        "required": true,
      },
      "summary": "Creates list of users with given input array",
      "tags": Array [
        "user",
      ],
      "x-codegen-request-body-name": "body",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithArray",
        "post",
        "*/*",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithArray",
        "post",
        "content",
        "*/*",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "*/*",
      "flatSchema": Object {
        "type": "array",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithArray",
        "post",
        "responses",
        "default",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithArray",
        "post",
        "responses",
        "default",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": null,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithList",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithList",
        "post",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "post",
      "operationId": "createUsersWithListInput",
      "pathPattern": "/user/createWithList",
      "requestBody": Object {
        "content": Object {
          "*/*": Object {
            "schema": Object {
              "items": Object {
                "$ref": "#/components/schemas/User",
              },
              "type": "array",
            },
          },
        },
        "description": "List of user object",
        "required": true,
      },
      "summary": "Creates list of users with given input array",
      "tags": Array [
        "user",
      ],
      "x-codegen-request-body-name": "body",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithList",
        "post",
        "*/*",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithList",
        "post",
        "content",
        "*/*",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "*/*",
      "flatSchema": Object {
        "type": "array",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/createWithList",
        "post",
        "responses",
        "default",
      ],
      "jsonPath": Array [
        "paths",
        "/user/createWithList",
        "post",
        "responses",
        "default",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": null,
    },
  },
  Object {
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
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "get",
      "operationId": "loginUser",
      "pathPattern": "/user/login",
      "summary": "Logs user into the system",
      "tags": Array [
        "user",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "parameters",
        "query",
        "username",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "parameters",
        0,
      ],
      "kind": "query",
      "location": "inRequest",
    },
    "value": Object {
      "description": "The user name for login",
      "in": "query",
      "name": "username",
      "required": true,
      "schema": Object {
        "type": "string",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "parameters",
        "query",
        "password",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "parameters",
        1,
      ],
      "kind": "query",
      "location": "inRequest",
    },
    "value": Object {
      "description": "The password for login in clear text",
      "in": "query",
      "name": "password",
      "required": true,
      "schema": Object {
        "type": "string",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "200",
        "headers",
        "X-Rate-Limit",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "200",
        "headers",
        "X-Rate-Limit",
      ],
      "kind": "header-parameter",
      "location": "inRequest",
    },
    "value": Object {
      "description": "calls per hour allowed by the user",
      "schema": Object {
        "format": "int32",
        "type": "integer",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/login",
        "get",
        "responses",
        "200",
        "headers",
        "X-Expires-After",
      ],
      "jsonPath": Array [
        "paths",
        "/user/login",
        "get",
        "responses",
        "200",
        "headers",
        "X-Expires-After",
      ],
      "kind": "header-parameter",
      "location": "inRequest",
    },
    "value": Object {
      "description": "date in UTC when token expires",
      "schema": Object {
        "format": "date-time",
        "type": "string",
      },
    },
  },
  Object {
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
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/xml",
      "flatSchema": Object {
        "type": "string",
      },
    },
  },
  Object {
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
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "type": "string",
      },
    },
  },
  Object {
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid username/password supplied",
      "statusCode": 400,
    },
  },
  Object {
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
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "get",
      "operationId": "logoutUser",
      "pathPattern": "/user/logout",
      "summary": "Logs out current logged in user session",
      "tags": Array [
        "user",
      ],
    },
  },
  Object {
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": null,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "method": "get",
      "operationId": "getUserByName",
      "pathPattern": "/user/{username}",
      "summary": "Get user by user name",
      "tags": Array [
        "user",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "get",
        "parameters",
        "path",
        "username",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "get",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "The name that needs to be fetched. Use user1 for testing. ",
      "in": "path",
      "name": "username",
      "required": true,
      "schema": Object {
        "type": "string",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/xml",
      "flatSchema": Object {
        "$ref": "#/components/schemas/User",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "contentType": "application/json",
      "flatSchema": Object {
        "$ref": "#/components/schemas/User",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "successful operation",
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid username supplied",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "User not found",
      "statusCode": 404,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "put",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "This can only be done by the logged in user.",
      "method": "put",
      "operationId": "updateUser",
      "pathPattern": "/user/{username}",
      "requestBody": Object {
        "content": Object {
          "*/*": Object {
            "schema": Object {
              "$ref": "#/components/schemas/User",
            },
          },
        },
        "description": "Updated user object",
        "required": true,
      },
      "summary": "Updated user",
      "tags": Array [
        "user",
      ],
      "x-codegen-request-body-name": "body",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "put",
        "parameters",
        "path",
        "username",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "name that need to be updated",
      "in": "path",
      "name": "username",
      "required": true,
      "schema": Object {
        "type": "string",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "put",
        "*/*",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
        "content",
        "*/*",
        "body",
      ],
      "kind": "body",
      "location": "inRequest",
    },
    "value": Object {
      "contentType": "*/*",
      "flatSchema": Object {
        "$ref": "#/components/schemas/User",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "put",
        "responses",
        "400",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
        "responses",
        "400",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid user supplied",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "put",
        "responses",
        "404",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
        "responses",
        "404",
      ],
      "kind": "response",
      "location": "inResponse",
    },
    "value": Object {
      "description": "User not found",
      "statusCode": 404,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "delete",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "delete",
      ],
      "kind": "operation",
      "location": "inRequest",
    },
    "value": Object {
      "description": "This can only be done by the logged in user.",
      "method": "delete",
      "operationId": "deleteUser",
      "pathPattern": "/user/{username}",
      "summary": "Delete user",
      "tags": Array [
        "user",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
        "delete",
        "parameters",
        "path",
        "username",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "delete",
        "parameters",
        0,
      ],
      "kind": "path",
      "location": "inRequest",
    },
    "value": Object {
      "description": "The name that needs to be deleted",
      "in": "path",
      "name": "username",
      "required": true,
      "schema": Object {
        "type": "string",
      },
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "Invalid username supplied",
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{}",
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
      "location": "inResponse",
    },
    "value": Object {
      "description": "User not found",
      "statusCode": 404,
    },
  },
]
`
