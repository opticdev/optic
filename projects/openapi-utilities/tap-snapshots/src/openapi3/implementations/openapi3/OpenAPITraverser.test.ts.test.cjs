/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/openapi3/implementations/openapi3/OpenAPITraverser.test.ts TAP > must match snapshot 1`] = `
Object {
  "$$normalized": true,
  "components": Object {
    "schemas": Object {
      "ApiResponse": Object {
        "properties": Object {
          "code": Object {
            "format": "int32",
            "type": "integer",
          },
          "message": Object {
            "type": "string",
          },
          "type": Object {
            "type": "string",
          },
        },
        "type": "object",
      },
      "Category": Object {
        "properties": Object {
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "name": Object {
            "type": "string",
          },
        },
        "type": "object",
        "xml": Object {
          "name": "Category",
        },
      },
      "Order": Object {
        "properties": Object {
          "complete": Object {
            "default": false,
            "type": "boolean",
          },
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "petId": Object {
            "format": "int64",
            "type": "integer",
          },
          "quantity": Object {
            "format": "int32",
            "type": "integer",
          },
          "shipDate": Object {
            "format": "date-time",
            "type": "string",
          },
          "status": Object {
            "description": "Order Status",
            "enum": Array [
              "placed",
              "approved",
              "delivered",
            ],
            "type": "string",
          },
        },
        "type": "object",
        "xml": Object {
          "name": "Order",
        },
      },
      "Pet": Object {
        "properties": Object {
          "category": Object {
            "$$ref": "#/components/schemas/Category",
            "properties": Object {
              "id": Object {
                "format": "int64",
                "type": "integer",
              },
              "name": Object {
                "type": "string",
              },
            },
            "type": "object",
            "xml": Object {
              "name": "Category",
            },
          },
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "name": Object {
            "example": "doggie",
            "type": "string",
          },
          "photoUrls": Object {
            "items": Object {
              "type": "string",
            },
            "type": "array",
            "xml": Object {
              "name": "photoUrl",
              "wrapped": true,
            },
          },
          "status": Object {
            "description": "pet status in the store",
            "enum": Array [
              "available",
              "pending",
              "sold",
            ],
            "type": "string",
          },
          "tags": Object {
            "items": Object {
              "$$ref": "#/components/schemas/Tag",
              "properties": Object {
                "id": Object {
                  "format": "int64",
                  "type": "integer",
                },
                "name": Object {
                  "type": "string",
                },
              },
              "type": "object",
              "xml": Object {
                "name": "Tag",
              },
            },
            "type": "array",
            "xml": Object {
              "name": "tag",
              "wrapped": true,
            },
          },
        },
        "required": Array [
          "name",
          "photoUrls",
        ],
        "type": "object",
        "xml": Object {
          "name": "Pet",
        },
      },
      "Tag": Object {
        "properties": Object {
          "id": Object {
            "format": "int64",
            "type": "integer",
          },
          "name": Object {
            "type": "string",
          },
        },
        "type": "object",
        "xml": Object {
          "name": "Tag",
        },
      },
      "User": Object {
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
        "type": "object",
        "xml": Object {
          "name": "User",
        },
      },
    },
    "securitySchemes": Object {
      "api_key": Object {
        "in": "header",
        "name": "api_key",
        "type": "apiKey",
      },
      "petstore_auth": Object {
        "flows": Object {
          "implicit": Object {
            "authorizationUrl": "http://petstore.swagger.io/oauth/dialog",
            "scopes": Object {
              "read:pets": "read your pets",
              "write:pets": "modify pets in your account",
            },
          },
        },
        "type": "oauth2",
      },
    },
  },
  "externalDocs": Object {
    "description": "Find out more about Swagger",
    "url": "http://swagger.io",
  },
  "info": Object {
    "contact": Object {
      "email": "apiteam@swagger.io",
    },
    "description": "This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key \`special-key\` to test the authorization     filters.",
    "license": Object {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
    },
    "termsOfService": "http://swagger.io/terms/",
    "title": "Swagger Petstore",
    "version": "1.0.0",
  },
  "openapi": "3.0.1",
  "paths": Object {
    "/pet/{petId}/uploadImage": Object {
      "post": Object {
        "__originalOperationId": "uploadFile",
        "operationId": "uploadFile",
        "parameters": Array [
          Object {
            "description": "ID of pet to update",
            "in": "path",
            "name": "petId",
            "required": true,
            "schema": Object {
              "format": "int64",
              "type": "integer",
            },
          },
        ],
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
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "$$ref": "#/components/schemas/ApiResponse",
                  "properties": Object {
                    "code": Object {
                      "format": "int32",
                      "type": "integer",
                    },
                    "message": Object {
                      "type": "string",
                    },
                    "type": Object {
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
              },
            },
            "description": "successful operation",
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
    "/store/inventory": Object {
      "get": Object {
        "__originalOperationId": "getInventory",
        "description": "Returns a map of status codes to quantities",
        "operationId": "getInventory",
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "additionalProperties": Object {
                    "format": "int32",
                    "type": "integer",
                  },
                  "type": "object",
                },
              },
            },
            "description": "successful operation",
          },
        },
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
    "/store/order": Object {
      "post": Object {
        "__originalOperationId": "placeOrder",
        "operationId": "placeOrder",
        "requestBody": Object {
          "content": Object {
            "*/*": Object {
              "schema": Object {
                "$$ref": "#/components/schemas/Order",
                "properties": Object {
                  "complete": Object {
                    "default": false,
                    "type": "boolean",
                  },
                  "id": Object {
                    "format": "int64",
                    "type": "integer",
                  },
                  "petId": Object {
                    "format": "int64",
                    "type": "integer",
                  },
                  "quantity": Object {
                    "format": "int32",
                    "type": "integer",
                  },
                  "shipDate": Object {
                    "format": "date-time",
                    "type": "string",
                  },
                  "status": Object {
                    "description": "Order Status",
                    "enum": Array [
                      "placed",
                      "approved",
                      "delivered",
                    ],
                    "type": "string",
                  },
                },
                "type": "object",
                "xml": Object {
                  "name": "Order",
                },
              },
            },
          },
          "description": "order placed for purchasing the pet",
          "required": true,
        },
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "$$ref": "#/components/schemas/Order",
                  "properties": Object {
                    "complete": Object {
                      "default": false,
                      "type": "boolean",
                    },
                    "id": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "petId": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "quantity": Object {
                      "format": "int32",
                      "type": "integer",
                    },
                    "shipDate": Object {
                      "format": "date-time",
                      "type": "string",
                    },
                    "status": Object {
                      "description": "Order Status",
                      "enum": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "type": "string",
                    },
                  },
                  "type": "object",
                  "xml": Object {
                    "name": "Order",
                  },
                },
              },
              "application/xml": Object {
                "schema": Object {
                  "$$ref": "#/components/schemas/Order",
                  "properties": Object {
                    "complete": Object {
                      "default": false,
                      "type": "boolean",
                    },
                    "id": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "petId": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "quantity": Object {
                      "format": "int32",
                      "type": "integer",
                    },
                    "shipDate": Object {
                      "format": "date-time",
                      "type": "string",
                    },
                    "status": Object {
                      "description": "Order Status",
                      "enum": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "type": "string",
                    },
                  },
                  "type": "object",
                  "xml": Object {
                    "name": "Order",
                  },
                },
              },
            },
            "description": "successful operation",
          },
          "400": Object {
            "content": Object {},
            "description": "Invalid Order",
          },
        },
        "summary": "Place an order for a pet",
        "tags": Array [
          "store",
        ],
        "x-codegen-request-body-name": "body",
      },
    },
    "/store/order/{orderId}": Object {
      "delete": Object {
        "__originalOperationId": "deleteOrder",
        "description": "For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors",
        "operationId": "deleteOrder",
        "parameters": Array [
          Object {
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
        ],
        "responses": Object {
          "400": Object {
            "content": Object {},
            "description": "Invalid ID supplied",
          },
          "404": Object {
            "content": Object {},
            "description": "Order not found",
          },
        },
        "summary": "Delete purchase order by ID",
        "tags": Array [
          "store",
        ],
      },
      "get": Object {
        "__originalOperationId": "getOrderById",
        "description": "For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions",
        "operationId": "getOrderById",
        "parameters": Array [
          Object {
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
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "$$ref": "#/components/schemas/Order",
                  "properties": Object {
                    "complete": Object {
                      "default": false,
                      "type": "boolean",
                    },
                    "id": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "petId": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "quantity": Object {
                      "format": "int32",
                      "type": "integer",
                    },
                    "shipDate": Object {
                      "format": "date-time",
                      "type": "string",
                    },
                    "status": Object {
                      "description": "Order Status",
                      "enum": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "type": "string",
                    },
                  },
                  "type": "object",
                  "xml": Object {
                    "name": "Order",
                  },
                },
              },
              "application/xml": Object {
                "schema": Object {
                  "$$ref": "#/components/schemas/Order",
                  "properties": Object {
                    "complete": Object {
                      "default": false,
                      "type": "boolean",
                    },
                    "id": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "petId": Object {
                      "format": "int64",
                      "type": "integer",
                    },
                    "quantity": Object {
                      "format": "int32",
                      "type": "integer",
                    },
                    "shipDate": Object {
                      "format": "date-time",
                      "type": "string",
                    },
                    "status": Object {
                      "description": "Order Status",
                      "enum": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "type": "string",
                    },
                  },
                  "type": "object",
                  "xml": Object {
                    "name": "Order",
                  },
                },
              },
            },
            "description": "successful operation",
          },
          "400": Object {
            "content": Object {},
            "description": "Invalid ID supplied",
          },
          "404": Object {
            "content": Object {},
            "description": "Order not found",
          },
        },
        "summary": "Find purchase order by ID",
        "tags": Array [
          "store",
        ],
      },
    },
    "/user": Object {
      "post": Object {
        "__originalOperationId": "createUser",
        "description": "This can only be done by the logged in user.",
        "operationId": "createUser",
        "requestBody": Object {
          "content": Object {
            "*/*": Object {
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
                "type": "object",
                "xml": Object {
                  "name": "User",
                },
              },
            },
          },
          "description": "Created user object",
          "required": true,
        },
        "responses": Object {
          "default": Object {
            "content": Object {},
            "description": "successful operation",
          },
        },
        "summary": "Create user",
        "tags": Array [
          "user",
        ],
        "x-codegen-request-body-name": "body",
      },
    },
    "/user/{username}": Object {
      "delete": Object {
        "__originalOperationId": "deleteUser",
        "description": "This can only be done by the logged in user.",
        "operationId": "deleteUser",
        "parameters": Array [
          Object {
            "description": "The name that needs to be deleted",
            "in": "path",
            "name": "username",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "400": Object {
            "content": Object {},
            "description": "Invalid username supplied",
          },
          "404": Object {
            "content": Object {},
            "description": "User not found",
          },
        },
        "summary": "Delete user",
        "tags": Array [
          "user",
        ],
      },
      "get": Object {
        "__originalOperationId": "getUserByName",
        "operationId": "getUserByName",
        "parameters": Array [
          Object {
            "description": "The name that needs to be fetched. Use user1 for testing. ",
            "in": "path",
            "name": "username",
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
                  "type": "object",
                  "xml": Object {
                    "name": "User",
                  },
                },
              },
              "application/xml": Object {
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
                  "type": "object",
                  "xml": Object {
                    "name": "User",
                  },
                },
              },
            },
            "description": "successful operation",
          },
          "400": Object {
            "content": Object {},
            "description": "Invalid username supplied",
          },
          "404": Object {
            "content": Object {},
            "description": "User not found",
          },
        },
        "summary": "Get user by user name",
        "tags": Array [
          "user",
        ],
      },
      "put": Object {
        "__originalOperationId": "updateUser",
        "description": "This can only be done by the logged in user.",
        "operationId": "updateUser",
        "parameters": Array [
          Object {
            "description": "name that need to be updated",
            "in": "path",
            "name": "username",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
        ],
        "requestBody": Object {
          "content": Object {
            "*/*": Object {
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
                "type": "object",
                "xml": Object {
                  "name": "User",
                },
              },
            },
          },
          "description": "Updated user object",
          "required": true,
        },
        "responses": Object {
          "400": Object {
            "content": Object {},
            "description": "Invalid user supplied",
          },
          "404": Object {
            "content": Object {},
            "description": "User not found",
          },
        },
        "summary": "Updated user",
        "tags": Array [
          "user",
        ],
        "x-codegen-request-body-name": "body",
      },
    },
    "/user/createWithArray": Object {
      "post": Object {
        "__originalOperationId": "createUsersWithArrayInput",
        "operationId": "createUsersWithArrayInput",
        "requestBody": Object {
          "content": Object {
            "*/*": Object {
              "schema": Object {
                "items": Object {
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
                  "type": "object",
                  "xml": Object {
                    "name": "User",
                  },
                },
                "type": "array",
              },
            },
          },
          "description": "List of user object",
          "required": true,
        },
        "responses": Object {
          "default": Object {
            "content": Object {},
            "description": "successful operation",
          },
        },
        "summary": "Creates list of users with given input array",
        "tags": Array [
          "user",
        ],
        "x-codegen-request-body-name": "body",
      },
    },
    "/user/createWithList": Object {
      "post": Object {
        "__originalOperationId": "createUsersWithListInput",
        "operationId": "createUsersWithListInput",
        "requestBody": Object {
          "content": Object {
            "*/*": Object {
              "schema": Object {
                "items": Object {
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
                  "type": "object",
                  "xml": Object {
                    "name": "User",
                  },
                },
                "type": "array",
              },
            },
          },
          "description": "List of user object",
          "required": true,
        },
        "responses": Object {
          "default": Object {
            "content": Object {},
            "description": "successful operation",
          },
        },
        "summary": "Creates list of users with given input array",
        "tags": Array [
          "user",
        ],
        "x-codegen-request-body-name": "body",
      },
    },
    "/user/login": Object {
      "get": Object {
        "__originalOperationId": "loginUser",
        "operationId": "loginUser",
        "parameters": Array [
          Object {
            "description": "The user name for login",
            "in": "query",
            "name": "username",
            "required": true,
            "schema": Object {
              "type": "string",
            },
          },
          Object {
            "description": "The password for login in clear text",
            "in": "query",
            "name": "password",
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
                  "type": "string",
                },
              },
              "application/xml": Object {
                "schema": Object {
                  "type": "string",
                },
              },
            },
            "description": "successful operation",
            "headers": Object {
              "X-Expires-After": Object {
                "description": "date in UTC when token expires",
                "schema": Object {
                  "format": "date-time",
                  "type": "string",
                },
              },
              "X-Rate-Limit": Object {
                "description": "calls per hour allowed by the user",
                "schema": Object {
                  "format": "int32",
                  "type": "integer",
                },
              },
            },
          },
          "400": Object {
            "content": Object {},
            "description": "Invalid username/password supplied",
          },
        },
        "summary": "Logs user into the system",
        "tags": Array [
          "user",
        ],
      },
    },
    "/user/logout": Object {
      "get": Object {
        "__originalOperationId": "logoutUser",
        "operationId": "logoutUser",
        "responses": Object {
          "default": Object {
            "content": Object {},
            "description": "successful operation",
          },
        },
        "summary": "Logs out current logged in user session",
        "tags": Array [
          "user",
        ],
      },
    },
  },
  "servers": Array [
    Object {
      "url": "https://petstore.swagger.io/v2",
    },
    Object {
      "url": "http://petstore.swagger.io/v2",
    },
  ],
  "tags": Array [
    Object {
      "description": "Everything about your Pets",
      "externalDocs": Object {
        "description": "Find out more",
        "url": "http://swagger.io",
      },
      "name": "pet",
    },
    Object {
      "description": "Access to Petstore orders",
      "name": "store",
    },
    Object {
      "description": "Operations about user",
      "externalDocs": Object {
        "description": "Find out more about our store",
        "url": "http://swagger.io",
      },
      "name": "user",
    },
  ],
}
`

exports[`src/openapi3/implementations/openapi3/OpenAPITraverser.test.ts TAP > must match snapshot 2`] = `
Array [
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
        "post",
      ],
      "jsonPath": Array [
        "paths",
        "/pet/{petId}/uploadImage",
        "post",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/pet/{petId}/uploadImage",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
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
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
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
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
        "post",
        "responses",
        "200",
        "application/json",
        "code",
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
        "properties",
        "code",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
        "post",
        "responses",
        "200",
        "application/json",
        "type",
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
        "properties",
        "type",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
        "post",
        "responses",
        "200",
        "application/json",
        "message",
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
        "properties",
        "message",
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/store/inventory",
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
    },
    "value": Object {},
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
      "kind": "object",
    },
    "value": Object {},
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/store/order",
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
    },
    "value": Object {},
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
      "kind": "object",
    },
    "value": Object {},
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
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "petId",
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
        "properties",
        "petId",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "quantity",
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
        "properties",
        "quantity",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "shipDate",
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
        "properties",
        "shipDate",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/xml",
        "status",
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
        "properties",
        "status",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/xml",
        "complete",
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
        "properties",
        "complete",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "boolean",
      ],
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
    },
    "value": Object {},
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
      "kind": "object",
    },
    "value": Object {},
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
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "petId",
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
        "properties",
        "petId",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "quantity",
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
        "properties",
        "quantity",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
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
        "shipDate",
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
        "properties",
        "shipDate",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/json",
        "status",
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
        "properties",
        "status",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order",
        "post",
        "responses",
        "200",
        "application/json",
        "complete",
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
        "properties",
        "complete",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "boolean",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "get",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/store/order/{orderId}",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "petId",
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
        "properties",
        "petId",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "quantity",
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
        "properties",
        "quantity",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "shipDate",
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
        "properties",
        "shipDate",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "status",
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
        "properties",
        "status",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/xml",
        "complete",
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
        "properties",
        "complete",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "boolean",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "petId",
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
        "properties",
        "petId",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "quantity",
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
        "properties",
        "quantity",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "shipDate",
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
        "properties",
        "shipDate",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "status",
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
        "properties",
        "status",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "get",
        "responses",
        "200",
        "application/json",
        "complete",
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
        "properties",
        "complete",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "boolean",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
        "delete",
      ],
      "jsonPath": Array [
        "paths",
        "/store/order/{orderId}",
        "delete",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "delete",
      "pathPattern": "/store/order/{orderId}",
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/user",
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/user/createWithArray",
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "post",
      "pathPattern": "/user/createWithList",
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/user/login",
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
    },
    "value": Object {},
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
    },
    "value": Object {},
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
      "kind": "endpoint",
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/user/logout",
    },
  },
  Object {
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
    },
    "value": Object {
      "method": "get",
      "pathPattern": "/user/{username}",
    },
  },
  Object {
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
    "value": Object {},
  },
  Object {
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
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "username",
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
        "properties",
        "username",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "firstName",
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
        "properties",
        "firstName",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "lastName",
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
        "properties",
        "lastName",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "email",
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
        "properties",
        "email",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "password",
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
        "properties",
        "password",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "phone",
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
        "properties",
        "phone",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/xml",
        "userStatus",
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
        "properties",
        "userStatus",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
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
    "value": Object {},
  },
  Object {
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
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "id",
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
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "username",
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
        "properties",
        "username",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "firstName",
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
        "properties",
        "firstName",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "lastName",
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
        "properties",
        "lastName",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "email",
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
        "properties",
        "email",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "password",
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
        "properties",
        "password",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "phone",
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
        "properties",
        "phone",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "get",
        "responses",
        "200",
        "application/json",
        "userStatus",
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
        "properties",
        "userStatus",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
        "put",
      ],
      "jsonPath": Array [
        "paths",
        "/user/{username}",
        "put",
      ],
      "kind": "endpoint",
    },
    "value": Object {
      "method": "put",
      "pathPattern": "/user/{username}",
    },
  },
  Object {
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
    },
    "value": Object {
      "method": "delete",
      "pathPattern": "/user/{username}",
    },
  },
]
`

exports[`src/openapi3/implementations/openapi3/OpenAPITraverser.test.ts TAP > must match snapshot 3`] = `
Array [
  Object {
    "location": Object {
      "conceptualPath": Array [],
      "jsonPath": Array [],
      "kind": "object",
    },
    "value": Object {},
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "id",
      ],
      "jsonPath": Array [
        "properties",
        "id",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "petId",
      ],
      "jsonPath": Array [
        "properties",
        "petId",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "quantity",
      ],
      "jsonPath": Array [
        "properties",
        "quantity",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "integer",
      ],
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "shipDate",
      ],
      "jsonPath": Array [
        "properties",
        "shipDate",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "status",
      ],
      "jsonPath": Array [
        "properties",
        "status",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "complete",
      ],
      "jsonPath": Array [
        "properties",
        "complete",
      ],
      "kind": "field",
    },
    "value": Object {
      "required": false,
      "schemaTypes": Array [
        "boolean",
      ],
    },
  },
]
`
