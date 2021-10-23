/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/openapi3/implementations/openapi3/openapi-traverser.test.ts TAP > must match snapshot 1`] = `
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

exports[`src/openapi3/implementations/openapi3/openapi-traverser.test.ts TAP > must match snapshot 2`] = `
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
      "stableId": "uploadFile",
    },
    "value": Object {
      "maturity": undefined,
      "method": "post",
      "pathPattern": "/pet/{petId}/uploadImage",
      "summary": "uploads an image",
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
    "value": Object {
      "contentType": "application/json",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/pet/{petId}/uploadImage",
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
      "stableId": "[\\"operations\\",\\"/pet/{petId}/uploadImage\\",\\"post\\",\\"responses\\",\\"200\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "getInventory",
    },
    "value": Object {
      "maturity": undefined,
      "method": "get",
      "pathPattern": "/store/inventory",
      "summary": "Returns pet inventories by status",
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
    "value": Object {
      "contentType": "application/json",
      "schema": Object {
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
      "stableId": "[\\"operations\\",\\"/store/inventory\\",\\"get\\",\\"responses\\",\\"200\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "placeOrder",
    },
    "value": Object {
      "maturity": undefined,
      "method": "post",
      "pathPattern": "/store/order",
      "summary": "Place an order for a pet",
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
    "value": Object {
      "contentType": "application/xml",
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
    "value": Object {
      "contentType": "application/json",
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
      "stableId": "[\\"operations\\",\\"/store/order\\",\\"post\\",\\"responses\\",\\"200\\"]",
    },
    "value": Object {
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
      "stableId": "[\\"operations\\",\\"/store/order\\",\\"post\\",\\"responses\\",\\"400\\"]",
    },
    "value": Object {
      "statusCode": 400,
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
      "stableId": "getOrderById",
    },
    "value": Object {
      "maturity": undefined,
      "method": "get",
      "pathPattern": "/store/order/{orderId}",
      "summary": "Find purchase order by ID",
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
    "value": Object {
      "contentType": "application/xml",
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
    "value": Object {
      "contentType": "application/json",
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
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "stableId": "[\\"operations\\",\\"/store/order/{orderId}\\",\\"get\\",\\"responses\\",\\"200\\"]",
    },
    "value": Object {
      "statusCode": 200,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "stableId": "[\\"operations\\",\\"/store/order/{orderId}\\",\\"get\\",\\"responses\\",\\"400\\"]",
    },
    "value": Object {
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "stableId": "[\\"operations\\",\\"/store/order/{orderId}\\",\\"get\\",\\"responses\\",\\"404\\"]",
    },
    "value": Object {
      "statusCode": 404,
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
      "stableId": "deleteOrder",
    },
    "value": Object {
      "maturity": undefined,
      "method": "delete",
      "pathPattern": "/store/order/{orderId}",
      "summary": "Delete purchase order by ID",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "stableId": "[\\"operations\\",\\"/store/order/{orderId}\\",\\"delete\\",\\"responses\\",\\"400\\"]",
    },
    "value": Object {
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/store/order/{orderId}",
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
      "stableId": "[\\"operations\\",\\"/store/order/{orderId}\\",\\"delete\\",\\"responses\\",\\"404\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "createUser",
    },
    "value": Object {
      "maturity": undefined,
      "method": "post",
      "pathPattern": "/user",
      "summary": "Create user",
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
      "stableId": "[\\"operations\\",\\"/user\\",\\"post\\",\\"responses\\",\\"default\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "createUsersWithArrayInput",
    },
    "value": Object {
      "maturity": undefined,
      "method": "post",
      "pathPattern": "/user/createWithArray",
      "summary": "Creates list of users with given input array",
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
      "stableId": "[\\"operations\\",\\"/user/createWithArray\\",\\"post\\",\\"responses\\",\\"default\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "createUsersWithListInput",
    },
    "value": Object {
      "maturity": undefined,
      "method": "post",
      "pathPattern": "/user/createWithList",
      "summary": "Creates list of users with given input array",
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
      "stableId": "[\\"operations\\",\\"/user/createWithList\\",\\"post\\",\\"responses\\",\\"default\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "loginUser",
    },
    "value": Object {
      "maturity": undefined,
      "method": "get",
      "pathPattern": "/user/login",
      "summary": "Logs user into the system",
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
    "value": Object {
      "contentType": "application/xml",
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
    "value": Object {
      "contentType": "application/json",
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
    "value": Object {
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
      "stableId": "[\\"operations\\",\\"/user/login\\",\\"get\\",\\"responses\\",\\"400\\"]",
    },
    "value": Object {
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
      "kind": "endpoint",
      "stableId": "logoutUser",
    },
    "value": Object {
      "maturity": undefined,
      "method": "get",
      "pathPattern": "/user/logout",
      "summary": "Logs out current logged in user session",
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
      "stableId": "[\\"operations\\",\\"/user/logout\\",\\"get\\",\\"responses\\",\\"default\\"]",
    },
    "value": Object {
      "statusCode": null,
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
      "stableId": "getUserByName",
    },
    "value": Object {
      "maturity": undefined,
      "method": "get",
      "pathPattern": "/user/{username}",
      "summary": "Get user by user name",
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
    "value": Object {
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
        "type": "object",
        "xml": Object {
          "name": "User",
        },
      },
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
    "value": Object {
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
        "type": "object",
        "xml": Object {
          "name": "User",
        },
      },
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
    "value": Object {
      "statusCode": 200,
    },
  },
  Object {
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
    "value": Object {
      "statusCode": 400,
    },
  },
  Object {
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
    "value": Object {
      "statusCode": 404,
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
      "stableId": "updateUser",
    },
    "value": Object {
      "maturity": undefined,
      "method": "put",
      "pathPattern": "/user/{username}",
      "summary": "Updated user",
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
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
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"put\\",\\"responses\\",\\"400\\"]",
    },
    "value": Object {
      "statusCode": 400,
    },
  },
  Object {
    "location": Object {
      "conceptualPath": Array [
        "operations",
        "/user/{username}",
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
      "stableId": "[\\"operations\\",\\"/user/{username}\\",\\"put\\",\\"responses\\",\\"404\\"]",
    },
    "value": Object {
      "statusCode": 404,
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
      "stableId": "deleteUser",
    },
    "value": Object {
      "maturity": undefined,
      "method": "delete",
      "pathPattern": "/user/{username}",
      "summary": "Delete user",
    },
  },
  Object {
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
    "value": Object {
      "statusCode": 400,
    },
  },
  Object {
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
    "value": Object {
      "statusCode": 404,
    },
  },
]
`
