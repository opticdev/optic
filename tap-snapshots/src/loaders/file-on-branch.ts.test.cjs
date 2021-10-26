/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/loaders/file-on-branch.ts TAP > must match snapshot 1`] = `
Object {
  "flattened": Object {
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
      "/user/{username}": Object {
        "delete": Object {
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
      "/user/createWithList": Object {
        "post": Object {
          "operationId": "createUsersWithListInput",
          "requestBody": Object {
            "content": Object {
              "*/*": Object {
                "schema": Object {
                  "items": Object {
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
  },
  "sourcemap": Object {
    "files": Array [
      Object {
        "index": 0,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/petstore0.json",
      },
    ],
    "map": Array [
      Array [
        "#",
        Object {
          "file": 0,
          "node": Array [
            0,
            11440,
          ],
        },
      ],
      Array [
        "#/openapi",
        Object {
          "file": 0,
          "key": Array [
            4,
            13,
          ],
          "node": Array [
            4,
            22,
          ],
          "value": Array [
            15,
            22,
          ],
        },
      ],
      Array [
        "#/info",
        Object {
          "file": 0,
          "key": Array [
            26,
            32,
          ],
          "node": Array [
            26,
            625,
          ],
          "value": Array [
            34,
            625,
          ],
        },
      ],
      Array [
        "#/info/title",
        Object {
          "file": 0,
          "key": Array [
            40,
            47,
          ],
          "node": Array [
            40,
            67,
          ],
          "value": Array [
            49,
            67,
          ],
        },
      ],
      Array [
        "#/info/description",
        Object {
          "file": 0,
          "key": Array [
            73,
            86,
          ],
          "node": Array [
            73,
            372,
          ],
          "value": Array [
            88,
            372,
          ],
        },
      ],
      Array [
        "#/info/termsOfService",
        Object {
          "file": 0,
          "key": Array [
            378,
            394,
          ],
          "node": Array [
            378,
            422,
          ],
          "value": Array [
            396,
            422,
          ],
        },
      ],
      Array [
        "#/info/contact",
        Object {
          "file": 0,
          "key": Array [
            428,
            437,
          ],
          "node": Array [
            428,
            482,
          ],
          "value": Array [
            439,
            482,
          ],
        },
      ],
      Array [
        "#/info/contact/email",
        Object {
          "file": 0,
          "key": Array [
            447,
            454,
          ],
          "node": Array [
            447,
            476,
          ],
          "value": Array [
            456,
            476,
          ],
        },
      ],
      Array [
        "#/info/license",
        Object {
          "file": 0,
          "key": Array [
            488,
            497,
          ],
          "node": Array [
            488,
            597,
          ],
          "value": Array [
            499,
            597,
          ],
        },
      ],
      Array [
        "#/info/license/name",
        Object {
          "file": 0,
          "key": Array [
            507,
            513,
          ],
          "node": Array [
            507,
            527,
          ],
          "value": Array [
            515,
            527,
          ],
        },
      ],
      Array [
        "#/info/license/url",
        Object {
          "file": 0,
          "key": Array [
            535,
            540,
          ],
          "node": Array [
            535,
            591,
          ],
          "value": Array [
            542,
            591,
          ],
        },
      ],
      Array [
        "#/info/version",
        Object {
          "file": 0,
          "key": Array [
            603,
            612,
          ],
          "node": Array [
            603,
            621,
          ],
          "value": Array [
            614,
            621,
          ],
        },
      ],
      Array [
        "#/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            629,
            643,
          ],
          "node": Array [
            629,
            731,
          ],
          "value": Array [
            645,
            731,
          ],
        },
      ],
      Array [
        "#/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            651,
            664,
          ],
          "node": Array [
            651,
            695,
          ],
          "value": Array [
            666,
            695,
          ],
        },
      ],
      Array [
        "#/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            701,
            706,
          ],
          "node": Array [
            701,
            727,
          ],
          "value": Array [
            708,
            727,
          ],
        },
      ],
      Array [
        "#/servers",
        Object {
          "file": 0,
          "key": Array [
            735,
            744,
          ],
          "node": Array [
            735,
            867,
          ],
          "value": Array [
            746,
            867,
          ],
        },
      ],
      Array [
        "#/servers/0",
        Object {
          "file": 0,
          "node": Array [
            752,
            805,
          ],
        },
      ],
      Array [
        "#/servers/0/url",
        Object {
          "file": 0,
          "key": Array [
            760,
            765,
          ],
          "node": Array [
            760,
            799,
          ],
          "value": Array [
            767,
            799,
          ],
        },
      ],
      Array [
        "#/servers/1",
        Object {
          "file": 0,
          "node": Array [
            811,
            863,
          ],
        },
      ],
      Array [
        "#/servers/1/url",
        Object {
          "file": 0,
          "key": Array [
            819,
            824,
          ],
          "node": Array [
            819,
            857,
          ],
          "value": Array [
            826,
            857,
          ],
        },
      ],
      Array [
        "#/tags",
        Object {
          "file": 0,
          "key": Array [
            871,
            877,
          ],
          "node": Array [
            871,
            1364,
          ],
          "value": Array [
            879,
            1364,
          ],
        },
      ],
      Array [
        "#/tags/0",
        Object {
          "file": 0,
          "node": Array [
            885,
            1071,
          ],
        },
      ],
      Array [
        "#/tags/0/name",
        Object {
          "file": 0,
          "key": Array [
            893,
            899,
          ],
          "node": Array [
            893,
            906,
          ],
          "value": Array [
            901,
            906,
          ],
        },
      ],
      Array [
        "#/tags/0/description",
        Object {
          "file": 0,
          "key": Array [
            914,
            927,
          ],
          "node": Array [
            914,
            957,
          ],
          "value": Array [
            929,
            957,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            965,
            979,
          ],
          "node": Array [
            965,
            1065,
          ],
          "value": Array [
            981,
            1065,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            991,
            1004,
          ],
          "node": Array [
            991,
            1021,
          ],
          "value": Array [
            1006,
            1021,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            1031,
            1036,
          ],
          "node": Array [
            1031,
            1057,
          ],
          "value": Array [
            1038,
            1057,
          ],
        },
      ],
      Array [
        "#/tags/1",
        Object {
          "file": 0,
          "node": Array [
            1077,
            1156,
          ],
        },
      ],
      Array [
        "#/tags/1/name",
        Object {
          "file": 0,
          "key": Array [
            1085,
            1091,
          ],
          "node": Array [
            1085,
            1100,
          ],
          "value": Array [
            1093,
            1100,
          ],
        },
      ],
      Array [
        "#/tags/1/description",
        Object {
          "file": 0,
          "key": Array [
            1108,
            1121,
          ],
          "node": Array [
            1108,
            1150,
          ],
          "value": Array [
            1123,
            1150,
          ],
        },
      ],
      Array [
        "#/tags/2",
        Object {
          "file": 0,
          "node": Array [
            1162,
            1360,
          ],
        },
      ],
      Array [
        "#/tags/2/name",
        Object {
          "file": 0,
          "key": Array [
            1170,
            1176,
          ],
          "node": Array [
            1170,
            1184,
          ],
          "value": Array [
            1178,
            1184,
          ],
        },
      ],
      Array [
        "#/tags/2/description",
        Object {
          "file": 0,
          "key": Array [
            1192,
            1205,
          ],
          "node": Array [
            1192,
            1230,
          ],
          "value": Array [
            1207,
            1230,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            1238,
            1252,
          ],
          "node": Array [
            1238,
            1354,
          ],
          "value": Array [
            1254,
            1354,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            1264,
            1277,
          ],
          "node": Array [
            1264,
            1310,
          ],
          "value": Array [
            1279,
            1310,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            1320,
            1325,
          ],
          "node": Array [
            1320,
            1346,
          ],
          "value": Array [
            1327,
            1346,
          ],
        },
      ],
      Array [
        "#/paths",
        Object {
          "file": 0,
          "key": Array [
            1368,
            1375,
          ],
          "node": Array [
            1368,
            7222,
          ],
          "value": Array [
            1377,
            7222,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList",
        Object {
          "file": 0,
          "key": Array [
            1383,
            1405,
          ],
          "node": Array [
            1383,
            2150,
          ],
          "value": Array [
            1407,
            2150,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post",
        Object {
          "file": 0,
          "key": Array [
            1415,
            1421,
          ],
          "node": Array [
            1415,
            2144,
          ],
          "value": Array [
            1423,
            2144,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags",
        Object {
          "file": 0,
          "key": Array [
            1433,
            1439,
          ],
          "node": Array [
            1433,
            1469,
          ],
          "value": Array [
            1441,
            1469,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags/0",
        Object {
          "file": 0,
          "node": Array [
            1453,
            1459,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/summary",
        Object {
          "file": 0,
          "key": Array [
            1479,
            1488,
          ],
          "node": Array [
            1479,
            1536,
          ],
          "value": Array [
            1490,
            1536,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/operationId",
        Object {
          "file": 0,
          "key": Array [
            1546,
            1559,
          ],
          "node": Array [
            1546,
            1587,
          ],
          "value": Array [
            1561,
            1587,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody",
        Object {
          "file": 0,
          "key": Array [
            1597,
            1610,
          ],
          "node": Array [
            1597,
            1943,
          ],
          "value": Array [
            1612,
            1943,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/description",
        Object {
          "file": 0,
          "key": Array [
            1624,
            1637,
          ],
          "node": Array [
            1624,
            1660,
          ],
          "value": Array [
            1639,
            1660,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content",
        Object {
          "file": 0,
          "key": Array [
            1672,
            1681,
          ],
          "node": Array [
            1672,
            1905,
          ],
          "value": Array [
            1683,
            1905,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*",
        Object {
          "file": 0,
          "key": Array [
            1697,
            1702,
          ],
          "node": Array [
            1697,
            1893,
          ],
          "value": Array [
            1704,
            1893,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema",
        Object {
          "file": 0,
          "key": Array [
            1720,
            1728,
          ],
          "node": Array [
            1720,
            1879,
          ],
          "value": Array [
            1730,
            1879,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/type",
        Object {
          "file": 0,
          "key": Array [
            1748,
            1754,
          ],
          "node": Array [
            1748,
            1763,
          ],
          "value": Array [
            1756,
            1763,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items",
        Object {
          "file": 0,
          "key": Array [
            8406,
            8412,
          ],
          "node": Array [
            8406,
            9160,
          ],
          "value": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/type",
        Object {
          "file": 0,
          "key": Array [
            8424,
            8430,
          ],
          "node": Array [
            8424,
            8440,
          ],
          "value": Array [
            8432,
            8440,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties",
        Object {
          "file": 0,
          "key": Array [
            8450,
            8462,
          ],
          "node": Array [
            8450,
            9099,
          ],
          "value": Array [
            8464,
            9099,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id",
        Object {
          "file": 0,
          "key": Array [
            8476,
            8480,
          ],
          "node": Array [
            8476,
            8556,
          ],
          "value": Array [
            8482,
            8556,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            8496,
            8502,
          ],
          "node": Array [
            8496,
            8513,
          ],
          "value": Array [
            8504,
            8513,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            8527,
            8535,
          ],
          "node": Array [
            8527,
            8544,
          ],
          "value": Array [
            8537,
            8544,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username",
        Object {
          "file": 0,
          "key": Array [
            8568,
            8578,
          ],
          "node": Array [
            8568,
            8622,
          ],
          "value": Array [
            8580,
            8622,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username/type",
        Object {
          "file": 0,
          "key": Array [
            8594,
            8600,
          ],
          "node": Array [
            8594,
            8610,
          ],
          "value": Array [
            8602,
            8610,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName",
        Object {
          "file": 0,
          "key": Array [
            8634,
            8645,
          ],
          "node": Array [
            8634,
            8689,
          ],
          "value": Array [
            8647,
            8689,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName/type",
        Object {
          "file": 0,
          "key": Array [
            8661,
            8667,
          ],
          "node": Array [
            8661,
            8677,
          ],
          "value": Array [
            8669,
            8677,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName",
        Object {
          "file": 0,
          "key": Array [
            8701,
            8711,
          ],
          "node": Array [
            8701,
            8755,
          ],
          "value": Array [
            8713,
            8755,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName/type",
        Object {
          "file": 0,
          "key": Array [
            8727,
            8733,
          ],
          "node": Array [
            8727,
            8743,
          ],
          "value": Array [
            8735,
            8743,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email",
        Object {
          "file": 0,
          "key": Array [
            8767,
            8774,
          ],
          "node": Array [
            8767,
            8818,
          ],
          "value": Array [
            8776,
            8818,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email/type",
        Object {
          "file": 0,
          "key": Array [
            8790,
            8796,
          ],
          "node": Array [
            8790,
            8806,
          ],
          "value": Array [
            8798,
            8806,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password",
        Object {
          "file": 0,
          "key": Array [
            8830,
            8840,
          ],
          "node": Array [
            8830,
            8884,
          ],
          "value": Array [
            8842,
            8884,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password/type",
        Object {
          "file": 0,
          "key": Array [
            8856,
            8862,
          ],
          "node": Array [
            8856,
            8872,
          ],
          "value": Array [
            8864,
            8872,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone",
        Object {
          "file": 0,
          "key": Array [
            8896,
            8903,
          ],
          "node": Array [
            8896,
            8947,
          ],
          "value": Array [
            8905,
            8947,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone/type",
        Object {
          "file": 0,
          "key": Array [
            8919,
            8925,
          ],
          "node": Array [
            8919,
            8935,
          ],
          "value": Array [
            8927,
            8935,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus",
        Object {
          "file": 0,
          "key": Array [
            8959,
            8971,
          ],
          "node": Array [
            8959,
            9089,
          ],
          "value": Array [
            8973,
            9089,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/type",
        Object {
          "file": 0,
          "key": Array [
            8987,
            8993,
          ],
          "node": Array [
            8987,
            9004,
          ],
          "value": Array [
            8995,
            9004,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/description",
        Object {
          "file": 0,
          "key": Array [
            9018,
            9031,
          ],
          "node": Array [
            9018,
            9046,
          ],
          "value": Array [
            9033,
            9046,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/format",
        Object {
          "file": 0,
          "key": Array [
            9060,
            9068,
          ],
          "node": Array [
            9060,
            9077,
          ],
          "value": Array [
            9070,
            9077,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/xml",
        Object {
          "file": 0,
          "key": Array [
            9109,
            9114,
          ],
          "node": Array [
            9109,
            9152,
          ],
          "value": Array [
            9116,
            9152,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/xml/name",
        Object {
          "file": 0,
          "key": Array [
            9128,
            9134,
          ],
          "node": Array [
            9128,
            9142,
          ],
          "value": Array [
            9136,
            9142,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/required",
        Object {
          "file": 0,
          "key": Array [
            1917,
            1927,
          ],
          "node": Array [
            1917,
            1933,
          ],
          "value": Array [
            1929,
            1933,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses",
        Object {
          "file": 0,
          "key": Array [
            1953,
            1964,
          ],
          "node": Array [
            1953,
            2089,
          ],
          "value": Array [
            1966,
            2089,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default",
        Object {
          "file": 0,
          "key": Array [
            1978,
            1987,
          ],
          "node": Array [
            1978,
            2079,
          ],
          "value": Array [
            1989,
            2079,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            2003,
            2016,
          ],
          "node": Array [
            2003,
            2040,
          ],
          "value": Array [
            2018,
            2040,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            2054,
            2063,
          ],
          "node": Array [
            2054,
            2067,
          ],
          "value": Array [
            2065,
            2067,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/x-codegen-request-body-name",
        Object {
          "file": 0,
          "key": Array [
            2099,
            2128,
          ],
          "node": Array [
            2099,
            2136,
          ],
          "value": Array [
            2130,
            2136,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login",
        Object {
          "file": 0,
          "key": Array [
            2156,
            2169,
          ],
          "node": Array [
            2156,
            3910,
          ],
          "value": Array [
            2171,
            3910,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get",
        Object {
          "file": 0,
          "key": Array [
            2179,
            2184,
          ],
          "node": Array [
            2179,
            3904,
          ],
          "value": Array [
            2186,
            3904,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags",
        Object {
          "file": 0,
          "key": Array [
            2196,
            2202,
          ],
          "node": Array [
            2196,
            2232,
          ],
          "value": Array [
            2204,
            2232,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags/0",
        Object {
          "file": 0,
          "node": Array [
            2216,
            2222,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/summary",
        Object {
          "file": 0,
          "key": Array [
            2242,
            2251,
          ],
          "node": Array [
            2242,
            2280,
          ],
          "value": Array [
            2253,
            2280,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/operationId",
        Object {
          "file": 0,
          "key": Array [
            2290,
            2303,
          ],
          "node": Array [
            2290,
            2316,
          ],
          "value": Array [
            2305,
            2316,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters",
        Object {
          "file": 0,
          "key": Array [
            2326,
            2338,
          ],
          "node": Array [
            2326,
            2837,
          ],
          "value": Array [
            2340,
            2837,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0",
        Object {
          "file": 0,
          "node": Array [
            2352,
            2577,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/name",
        Object {
          "file": 0,
          "key": Array [
            2366,
            2372,
          ],
          "node": Array [
            2366,
            2384,
          ],
          "value": Array [
            2374,
            2384,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/in",
        Object {
          "file": 0,
          "key": Array [
            2398,
            2402,
          ],
          "node": Array [
            2398,
            2411,
          ],
          "value": Array [
            2404,
            2411,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/description",
        Object {
          "file": 0,
          "key": Array [
            2425,
            2438,
          ],
          "node": Array [
            2425,
            2465,
          ],
          "value": Array [
            2440,
            2465,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/required",
        Object {
          "file": 0,
          "key": Array [
            2479,
            2489,
          ],
          "node": Array [
            2479,
            2495,
          ],
          "value": Array [
            2491,
            2495,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema",
        Object {
          "file": 0,
          "key": Array [
            2509,
            2517,
          ],
          "node": Array [
            2509,
            2565,
          ],
          "value": Array [
            2519,
            2565,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema/type",
        Object {
          "file": 0,
          "key": Array [
            2535,
            2541,
          ],
          "node": Array [
            2535,
            2551,
          ],
          "value": Array [
            2543,
            2551,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1",
        Object {
          "file": 0,
          "node": Array [
            2589,
            2827,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/name",
        Object {
          "file": 0,
          "key": Array [
            2603,
            2609,
          ],
          "node": Array [
            2603,
            2621,
          ],
          "value": Array [
            2611,
            2621,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/in",
        Object {
          "file": 0,
          "key": Array [
            2635,
            2639,
          ],
          "node": Array [
            2635,
            2648,
          ],
          "value": Array [
            2641,
            2648,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/description",
        Object {
          "file": 0,
          "key": Array [
            2662,
            2675,
          ],
          "node": Array [
            2662,
            2715,
          ],
          "value": Array [
            2677,
            2715,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/required",
        Object {
          "file": 0,
          "key": Array [
            2729,
            2739,
          ],
          "node": Array [
            2729,
            2745,
          ],
          "value": Array [
            2741,
            2745,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema",
        Object {
          "file": 0,
          "key": Array [
            2759,
            2767,
          ],
          "node": Array [
            2759,
            2815,
          ],
          "value": Array [
            2769,
            2815,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema/type",
        Object {
          "file": 0,
          "key": Array [
            2785,
            2791,
          ],
          "node": Array [
            2785,
            2801,
          ],
          "value": Array [
            2793,
            2801,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses",
        Object {
          "file": 0,
          "key": Array [
            2847,
            2858,
          ],
          "node": Array [
            2847,
            3896,
          ],
          "value": Array [
            2860,
            3896,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200",
        Object {
          "file": 0,
          "key": Array [
            2872,
            2877,
          ],
          "node": Array [
            2872,
            3763,
          ],
          "value": Array [
            2879,
            3763,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/description",
        Object {
          "file": 0,
          "key": Array [
            2893,
            2906,
          ],
          "node": Array [
            2893,
            2930,
          ],
          "value": Array [
            2908,
            2930,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers",
        Object {
          "file": 0,
          "key": Array [
            2944,
            2953,
          ],
          "node": Array [
            2944,
            3445,
          ],
          "value": Array [
            2955,
            3445,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit",
        Object {
          "file": 0,
          "key": Array [
            2971,
            2985,
          ],
          "node": Array [
            2971,
            3192,
          ],
          "value": Array [
            2987,
            3192,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/description",
        Object {
          "file": 0,
          "key": Array [
            3005,
            3018,
          ],
          "node": Array [
            3005,
            3056,
          ],
          "value": Array [
            3020,
            3056,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema",
        Object {
          "file": 0,
          "key": Array [
            3074,
            3082,
          ],
          "node": Array [
            3074,
            3176,
          ],
          "value": Array [
            3084,
            3176,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema/type",
        Object {
          "file": 0,
          "key": Array [
            3104,
            3110,
          ],
          "node": Array [
            3104,
            3121,
          ],
          "value": Array [
            3112,
            3121,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema/format",
        Object {
          "file": 0,
          "key": Array [
            3141,
            3149,
          ],
          "node": Array [
            3141,
            3158,
          ],
          "value": Array [
            3151,
            3158,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After",
        Object {
          "file": 0,
          "key": Array [
            3208,
            3225,
          ],
          "node": Array [
            3208,
            3431,
          ],
          "value": Array [
            3227,
            3431,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/description",
        Object {
          "file": 0,
          "key": Array [
            3245,
            3258,
          ],
          "node": Array [
            3245,
            3292,
          ],
          "value": Array [
            3260,
            3292,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema",
        Object {
          "file": 0,
          "key": Array [
            3310,
            3318,
          ],
          "node": Array [
            3310,
            3415,
          ],
          "value": Array [
            3320,
            3415,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema/type",
        Object {
          "file": 0,
          "key": Array [
            3340,
            3346,
          ],
          "node": Array [
            3340,
            3356,
          ],
          "value": Array [
            3348,
            3356,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema/format",
        Object {
          "file": 0,
          "key": Array [
            3376,
            3384,
          ],
          "node": Array [
            3376,
            3397,
          ],
          "value": Array [
            3386,
            3397,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content",
        Object {
          "file": 0,
          "key": Array [
            3459,
            3468,
          ],
          "node": Array [
            3459,
            3751,
          ],
          "value": Array [
            3470,
            3751,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml",
        Object {
          "file": 0,
          "key": Array [
            3486,
            3503,
          ],
          "node": Array [
            3486,
            3603,
          ],
          "value": Array [
            3505,
            3603,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml/schema",
        Object {
          "file": 0,
          "key": Array [
            3523,
            3531,
          ],
          "node": Array [
            3523,
            3587,
          ],
          "value": Array [
            3533,
            3587,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml/schema/type",
        Object {
          "file": 0,
          "key": Array [
            3553,
            3559,
          ],
          "node": Array [
            3553,
            3569,
          ],
          "value": Array [
            3561,
            3569,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json",
        Object {
          "file": 0,
          "key": Array [
            3619,
            3637,
          ],
          "node": Array [
            3619,
            3737,
          ],
          "value": Array [
            3639,
            3737,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json/schema",
        Object {
          "file": 0,
          "key": Array [
            3657,
            3665,
          ],
          "node": Array [
            3657,
            3721,
          ],
          "value": Array [
            3667,
            3721,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json/schema/type",
        Object {
          "file": 0,
          "key": Array [
            3687,
            3693,
          ],
          "node": Array [
            3687,
            3703,
          ],
          "value": Array [
            3695,
            3703,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400",
        Object {
          "file": 0,
          "key": Array [
            3775,
            3780,
          ],
          "node": Array [
            3775,
            3886,
          ],
          "value": Array [
            3782,
            3886,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400/description",
        Object {
          "file": 0,
          "key": Array [
            3796,
            3809,
          ],
          "node": Array [
            3796,
            3847,
          ],
          "value": Array [
            3811,
            3847,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400/content",
        Object {
          "file": 0,
          "key": Array [
            3861,
            3870,
          ],
          "node": Array [
            3861,
            3874,
          ],
          "value": Array [
            3872,
            3874,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout",
        Object {
          "file": 0,
          "key": Array [
            3916,
            3930,
          ],
          "node": Array [
            3916,
            4252,
          ],
          "value": Array [
            3932,
            4252,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get",
        Object {
          "file": 0,
          "key": Array [
            3940,
            3945,
          ],
          "node": Array [
            3940,
            4246,
          ],
          "value": Array [
            3947,
            4246,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags",
        Object {
          "file": 0,
          "key": Array [
            3957,
            3963,
          ],
          "node": Array [
            3957,
            3993,
          ],
          "value": Array [
            3965,
            3993,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags/0",
        Object {
          "file": 0,
          "node": Array [
            3977,
            3983,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/summary",
        Object {
          "file": 0,
          "key": Array [
            4003,
            4012,
          ],
          "node": Array [
            4003,
            4055,
          ],
          "value": Array [
            4014,
            4055,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/operationId",
        Object {
          "file": 0,
          "key": Array [
            4065,
            4078,
          ],
          "node": Array [
            4065,
            4092,
          ],
          "value": Array [
            4080,
            4092,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses",
        Object {
          "file": 0,
          "key": Array [
            4102,
            4113,
          ],
          "node": Array [
            4102,
            4238,
          ],
          "value": Array [
            4115,
            4238,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default",
        Object {
          "file": 0,
          "key": Array [
            4127,
            4136,
          ],
          "node": Array [
            4127,
            4228,
          ],
          "value": Array [
            4138,
            4228,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            4152,
            4165,
          ],
          "node": Array [
            4152,
            4189,
          ],
          "value": Array [
            4167,
            4189,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            4203,
            4212,
          ],
          "node": Array [
            4203,
            4216,
          ],
          "value": Array [
            4214,
            4216,
          ],
        },
      ],
      Array [
        "#/components",
        Object {
          "file": 0,
          "key": Array [
            7226,
            7238,
          ],
          "node": Array [
            7226,
            11437,
          ],
          "value": Array [
            7240,
            11437,
          ],
        },
      ],
      Array [
        "#/components/schemas",
        Object {
          "file": 0,
          "key": Array [
            7246,
            7255,
          ],
          "node": Array [
            7246,
            10957,
          ],
          "value": Array [
            7257,
            10957,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order",
        Object {
          "file": 0,
          "key": Array [
            7265,
            7272,
          ],
          "node": Array [
            7265,
            8099,
          ],
          "value": Array [
            7274,
            8099,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/type",
        Object {
          "file": 0,
          "key": Array [
            7284,
            7290,
          ],
          "node": Array [
            7284,
            7300,
          ],
          "value": Array [
            7292,
            7300,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties",
        Object {
          "file": 0,
          "key": Array [
            7310,
            7322,
          ],
          "node": Array [
            7310,
            8037,
          ],
          "value": Array [
            7324,
            8037,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id",
        Object {
          "file": 0,
          "key": Array [
            7336,
            7340,
          ],
          "node": Array [
            7336,
            7416,
          ],
          "value": Array [
            7342,
            7416,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            7356,
            7362,
          ],
          "node": Array [
            7356,
            7373,
          ],
          "value": Array [
            7364,
            7373,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            7387,
            7395,
          ],
          "node": Array [
            7387,
            7404,
          ],
          "value": Array [
            7397,
            7404,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId",
        Object {
          "file": 0,
          "key": Array [
            7428,
            7435,
          ],
          "node": Array [
            7428,
            7511,
          ],
          "value": Array [
            7437,
            7511,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId/type",
        Object {
          "file": 0,
          "key": Array [
            7451,
            7457,
          ],
          "node": Array [
            7451,
            7468,
          ],
          "value": Array [
            7459,
            7468,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId/format",
        Object {
          "file": 0,
          "key": Array [
            7482,
            7490,
          ],
          "node": Array [
            7482,
            7499,
          ],
          "value": Array [
            7492,
            7499,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity",
        Object {
          "file": 0,
          "key": Array [
            7523,
            7533,
          ],
          "node": Array [
            7523,
            7609,
          ],
          "value": Array [
            7535,
            7609,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity/type",
        Object {
          "file": 0,
          "key": Array [
            7549,
            7555,
          ],
          "node": Array [
            7549,
            7566,
          ],
          "value": Array [
            7557,
            7566,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity/format",
        Object {
          "file": 0,
          "key": Array [
            7580,
            7588,
          ],
          "node": Array [
            7580,
            7597,
          ],
          "value": Array [
            7590,
            7597,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate",
        Object {
          "file": 0,
          "key": Array [
            7621,
            7631,
          ],
          "node": Array [
            7621,
            7710,
          ],
          "value": Array [
            7633,
            7710,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate/type",
        Object {
          "file": 0,
          "key": Array [
            7647,
            7653,
          ],
          "node": Array [
            7647,
            7663,
          ],
          "value": Array [
            7655,
            7663,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate/format",
        Object {
          "file": 0,
          "key": Array [
            7677,
            7685,
          ],
          "node": Array [
            7677,
            7698,
          ],
          "value": Array [
            7687,
            7698,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status",
        Object {
          "file": 0,
          "key": Array [
            7722,
            7730,
          ],
          "node": Array [
            7722,
            7930,
          ],
          "value": Array [
            7732,
            7930,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/type",
        Object {
          "file": 0,
          "key": Array [
            7746,
            7752,
          ],
          "node": Array [
            7746,
            7762,
          ],
          "value": Array [
            7754,
            7762,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/description",
        Object {
          "file": 0,
          "key": Array [
            7776,
            7789,
          ],
          "node": Array [
            7776,
            7805,
          ],
          "value": Array [
            7791,
            7805,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum",
        Object {
          "file": 0,
          "key": Array [
            7819,
            7825,
          ],
          "node": Array [
            7819,
            7918,
          ],
          "value": Array [
            7827,
            7918,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/0",
        Object {
          "file": 0,
          "node": Array [
            7843,
            7851,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/1",
        Object {
          "file": 0,
          "node": Array [
            7867,
            7877,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/2",
        Object {
          "file": 0,
          "node": Array [
            7893,
            7904,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete",
        Object {
          "file": 0,
          "key": Array [
            7942,
            7952,
          ],
          "node": Array [
            7942,
            8027,
          ],
          "value": Array [
            7954,
            8027,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete/type",
        Object {
          "file": 0,
          "key": Array [
            7968,
            7974,
          ],
          "node": Array [
            7968,
            7985,
          ],
          "value": Array [
            7976,
            7985,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete/default",
        Object {
          "file": 0,
          "key": Array [
            7999,
            8008,
          ],
          "node": Array [
            7999,
            8015,
          ],
          "value": Array [
            8010,
            8015,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/xml",
        Object {
          "file": 0,
          "key": Array [
            8047,
            8052,
          ],
          "node": Array [
            8047,
            8091,
          ],
          "value": Array [
            8054,
            8091,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/xml/name",
        Object {
          "file": 0,
          "key": Array [
            8066,
            8072,
          ],
          "node": Array [
            8066,
            8081,
          ],
          "value": Array [
            8074,
            8081,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category",
        Object {
          "file": 0,
          "key": Array [
            8107,
            8117,
          ],
          "node": Array [
            8107,
            8398,
          ],
          "value": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/type",
        Object {
          "file": 0,
          "key": Array [
            8129,
            8135,
          ],
          "node": Array [
            8129,
            8145,
          ],
          "value": Array [
            8137,
            8145,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties",
        Object {
          "file": 0,
          "key": Array [
            8155,
            8167,
          ],
          "node": Array [
            8155,
            8333,
          ],
          "value": Array [
            8169,
            8333,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id",
        Object {
          "file": 0,
          "key": Array [
            8181,
            8185,
          ],
          "node": Array [
            8181,
            8261,
          ],
          "value": Array [
            8187,
            8261,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            8201,
            8207,
          ],
          "node": Array [
            8201,
            8218,
          ],
          "value": Array [
            8209,
            8218,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            8232,
            8240,
          ],
          "node": Array [
            8232,
            8249,
          ],
          "value": Array [
            8242,
            8249,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name",
        Object {
          "file": 0,
          "key": Array [
            8273,
            8279,
          ],
          "node": Array [
            8273,
            8323,
          ],
          "value": Array [
            8281,
            8323,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            8295,
            8301,
          ],
          "node": Array [
            8295,
            8311,
          ],
          "value": Array [
            8303,
            8311,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml",
        Object {
          "file": 0,
          "key": Array [
            8343,
            8348,
          ],
          "node": Array [
            8343,
            8390,
          ],
          "value": Array [
            8350,
            8390,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml/name",
        Object {
          "file": 0,
          "key": Array [
            8362,
            8368,
          ],
          "node": Array [
            8362,
            8380,
          ],
          "value": Array [
            8370,
            8380,
          ],
        },
      ],
      Array [
        "#/components/schemas/User",
        Object {
          "file": 0,
          "key": Array [
            8406,
            8412,
          ],
          "node": Array [
            8406,
            9160,
          ],
          "value": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag",
        Object {
          "file": 0,
          "key": Array [
            9168,
            9173,
          ],
          "node": Array [
            9168,
            9449,
          ],
          "value": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/type",
        Object {
          "file": 0,
          "key": Array [
            9185,
            9191,
          ],
          "node": Array [
            9185,
            9201,
          ],
          "value": Array [
            9193,
            9201,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties",
        Object {
          "file": 0,
          "key": Array [
            9211,
            9223,
          ],
          "node": Array [
            9211,
            9389,
          ],
          "value": Array [
            9225,
            9389,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id",
        Object {
          "file": 0,
          "key": Array [
            9237,
            9241,
          ],
          "node": Array [
            9237,
            9317,
          ],
          "value": Array [
            9243,
            9317,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            9257,
            9263,
          ],
          "node": Array [
            9257,
            9274,
          ],
          "value": Array [
            9265,
            9274,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            9288,
            9296,
          ],
          "node": Array [
            9288,
            9305,
          ],
          "value": Array [
            9298,
            9305,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name",
        Object {
          "file": 0,
          "key": Array [
            9329,
            9335,
          ],
          "node": Array [
            9329,
            9379,
          ],
          "value": Array [
            9337,
            9379,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            9351,
            9357,
          ],
          "node": Array [
            9351,
            9367,
          ],
          "value": Array [
            9359,
            9367,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml",
        Object {
          "file": 0,
          "key": Array [
            9399,
            9404,
          ],
          "node": Array [
            9399,
            9441,
          ],
          "value": Array [
            9406,
            9441,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml/name",
        Object {
          "file": 0,
          "key": Array [
            9418,
            9424,
          ],
          "node": Array [
            9418,
            9431,
          ],
          "value": Array [
            9426,
            9431,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet",
        Object {
          "file": 0,
          "key": Array [
            9457,
            9462,
          ],
          "node": Array [
            9457,
            10639,
          ],
          "value": Array [
            9464,
            10639,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required",
        Object {
          "file": 0,
          "key": Array [
            9474,
            9484,
          ],
          "node": Array [
            9474,
            9537,
          ],
          "value": Array [
            9486,
            9537,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/0",
        Object {
          "file": 0,
          "node": Array [
            9498,
            9504,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/1",
        Object {
          "file": 0,
          "node": Array [
            9516,
            9527,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/type",
        Object {
          "file": 0,
          "key": Array [
            9547,
            9553,
          ],
          "node": Array [
            9547,
            9563,
          ],
          "value": Array [
            9555,
            9563,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties",
        Object {
          "file": 0,
          "key": Array [
            9573,
            9585,
          ],
          "node": Array [
            9573,
            10579,
          ],
          "value": Array [
            9587,
            10579,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id",
        Object {
          "file": 0,
          "key": Array [
            9599,
            9603,
          ],
          "node": Array [
            9599,
            9679,
          ],
          "value": Array [
            9605,
            9679,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            9619,
            9625,
          ],
          "node": Array [
            9619,
            9636,
          ],
          "value": Array [
            9627,
            9636,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            9650,
            9658,
          ],
          "node": Array [
            9650,
            9667,
          ],
          "value": Array [
            9660,
            9667,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/category",
        Object {
          "file": 0,
          "key": Array [
            8107,
            8117,
          ],
          "node": Array [
            8107,
            8398,
          ],
          "value": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name",
        Object {
          "file": 0,
          "key": Array [
            9780,
            9786,
          ],
          "node": Array [
            9780,
            9863,
          ],
          "value": Array [
            9788,
            9863,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            9802,
            9808,
          ],
          "node": Array [
            9802,
            9818,
          ],
          "value": Array [
            9810,
            9818,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/example",
        Object {
          "file": 0,
          "key": Array [
            9832,
            9841,
          ],
          "node": Array [
            9832,
            9851,
          ],
          "value": Array [
            9843,
            9851,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls",
        Object {
          "file": 0,
          "key": Array [
            9875,
            9886,
          ],
          "node": Array [
            9875,
            10098,
          ],
          "value": Array [
            9888,
            10098,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/type",
        Object {
          "file": 0,
          "key": Array [
            9902,
            9908,
          ],
          "node": Array [
            9902,
            9917,
          ],
          "value": Array [
            9910,
            9917,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml",
        Object {
          "file": 0,
          "key": Array [
            9931,
            9936,
          ],
          "node": Array [
            9931,
            10017,
          ],
          "value": Array [
            9938,
            10017,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/name",
        Object {
          "file": 0,
          "key": Array [
            9954,
            9960,
          ],
          "node": Array [
            9954,
            9972,
          ],
          "value": Array [
            9962,
            9972,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/wrapped",
        Object {
          "file": 0,
          "key": Array [
            9988,
            9997,
          ],
          "node": Array [
            9988,
            10003,
          ],
          "value": Array [
            9999,
            10003,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items",
        Object {
          "file": 0,
          "key": Array [
            10031,
            10038,
          ],
          "node": Array [
            10031,
            10086,
          ],
          "value": Array [
            10040,
            10086,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items/type",
        Object {
          "file": 0,
          "key": Array [
            10056,
            10062,
          ],
          "node": Array [
            10056,
            10072,
          ],
          "value": Array [
            10064,
            10072,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags",
        Object {
          "file": 0,
          "key": Array [
            10110,
            10116,
          ],
          "node": Array [
            10110,
            10341,
          ],
          "value": Array [
            10118,
            10341,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/type",
        Object {
          "file": 0,
          "key": Array [
            10132,
            10138,
          ],
          "node": Array [
            10132,
            10147,
          ],
          "value": Array [
            10140,
            10147,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml",
        Object {
          "file": 0,
          "key": Array [
            10161,
            10166,
          ],
          "node": Array [
            10161,
            10242,
          ],
          "value": Array [
            10168,
            10242,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/name",
        Object {
          "file": 0,
          "key": Array [
            10184,
            10190,
          ],
          "node": Array [
            10184,
            10197,
          ],
          "value": Array [
            10192,
            10197,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/wrapped",
        Object {
          "file": 0,
          "key": Array [
            10213,
            10222,
          ],
          "node": Array [
            10213,
            10228,
          ],
          "value": Array [
            10224,
            10228,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/items",
        Object {
          "file": 0,
          "key": Array [
            9168,
            9173,
          ],
          "node": Array [
            9168,
            9449,
          ],
          "value": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status",
        Object {
          "file": 0,
          "key": Array [
            10353,
            10361,
          ],
          "node": Array [
            10353,
            10569,
          ],
          "value": Array [
            10363,
            10569,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/type",
        Object {
          "file": 0,
          "key": Array [
            10377,
            10383,
          ],
          "node": Array [
            10377,
            10393,
          ],
          "value": Array [
            10385,
            10393,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/description",
        Object {
          "file": 0,
          "key": Array [
            10407,
            10420,
          ],
          "node": Array [
            10407,
            10447,
          ],
          "value": Array [
            10422,
            10447,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum",
        Object {
          "file": 0,
          "key": Array [
            10461,
            10467,
          ],
          "node": Array [
            10461,
            10557,
          ],
          "value": Array [
            10469,
            10557,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/0",
        Object {
          "file": 0,
          "node": Array [
            10485,
            10496,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/1",
        Object {
          "file": 0,
          "node": Array [
            10512,
            10521,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/2",
        Object {
          "file": 0,
          "node": Array [
            10537,
            10543,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml",
        Object {
          "file": 0,
          "key": Array [
            10589,
            10594,
          ],
          "node": Array [
            10589,
            10631,
          ],
          "value": Array [
            10596,
            10631,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml/name",
        Object {
          "file": 0,
          "key": Array [
            10608,
            10614,
          ],
          "node": Array [
            10608,
            10621,
          ],
          "value": Array [
            10616,
            10621,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse",
        Object {
          "file": 0,
          "key": Array [
            10647,
            10660,
          ],
          "node": Array [
            10647,
            10951,
          ],
          "value": Array [
            10662,
            10951,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/type",
        Object {
          "file": 0,
          "key": Array [
            10672,
            10678,
          ],
          "node": Array [
            10672,
            10688,
          ],
          "value": Array [
            10680,
            10688,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties",
        Object {
          "file": 0,
          "key": Array [
            10698,
            10710,
          ],
          "node": Array [
            10698,
            10943,
          ],
          "value": Array [
            10712,
            10943,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code",
        Object {
          "file": 0,
          "key": Array [
            10724,
            10730,
          ],
          "node": Array [
            10724,
            10806,
          ],
          "value": Array [
            10732,
            10806,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code/type",
        Object {
          "file": 0,
          "key": Array [
            10746,
            10752,
          ],
          "node": Array [
            10746,
            10763,
          ],
          "value": Array [
            10754,
            10763,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code/format",
        Object {
          "file": 0,
          "key": Array [
            10777,
            10785,
          ],
          "node": Array [
            10777,
            10794,
          ],
          "value": Array [
            10787,
            10794,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/type",
        Object {
          "file": 0,
          "key": Array [
            10818,
            10824,
          ],
          "node": Array [
            10818,
            10868,
          ],
          "value": Array [
            10826,
            10868,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/type/type",
        Object {
          "file": 0,
          "key": Array [
            10840,
            10846,
          ],
          "node": Array [
            10840,
            10856,
          ],
          "value": Array [
            10848,
            10856,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/message",
        Object {
          "file": 0,
          "key": Array [
            10880,
            10889,
          ],
          "node": Array [
            10880,
            10933,
          ],
          "value": Array [
            10891,
            10933,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/message/type",
        Object {
          "file": 0,
          "key": Array [
            10905,
            10911,
          ],
          "node": Array [
            10905,
            10921,
          ],
          "value": Array [
            10913,
            10921,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes",
        Object {
          "file": 0,
          "key": Array [
            10963,
            10980,
          ],
          "node": Array [
            10963,
            11433,
          ],
          "value": Array [
            10982,
            11433,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth",
        Object {
          "file": 0,
          "key": Array [
            10990,
            11005,
          ],
          "node": Array [
            10990,
            11323,
          ],
          "value": Array [
            11007,
            11323,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/type",
        Object {
          "file": 0,
          "key": Array [
            11017,
            11023,
          ],
          "node": Array [
            11017,
            11033,
          ],
          "value": Array [
            11025,
            11033,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows",
        Object {
          "file": 0,
          "key": Array [
            11043,
            11050,
          ],
          "node": Array [
            11043,
            11315,
          ],
          "value": Array [
            11052,
            11315,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit",
        Object {
          "file": 0,
          "key": Array [
            11064,
            11074,
          ],
          "node": Array [
            11064,
            11305,
          ],
          "value": Array [
            11076,
            11305,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/authorizationUrl",
        Object {
          "file": 0,
          "key": Array [
            11090,
            11108,
          ],
          "node": Array [
            11090,
            11151,
          ],
          "value": Array [
            11110,
            11151,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/scopes",
        Object {
          "file": 0,
          "key": Array [
            11165,
            11173,
          ],
          "node": Array [
            11165,
            11293,
          ],
          "value": Array [
            11175,
            11293,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key",
        Object {
          "file": 0,
          "key": Array [
            11331,
            11340,
          ],
          "node": Array [
            11331,
            11427,
          ],
          "value": Array [
            11342,
            11427,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/type",
        Object {
          "file": 0,
          "key": Array [
            11352,
            11358,
          ],
          "node": Array [
            11352,
            11368,
          ],
          "value": Array [
            11360,
            11368,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/name",
        Object {
          "file": 0,
          "key": Array [
            11378,
            11384,
          ],
          "node": Array [
            11378,
            11395,
          ],
          "value": Array [
            11386,
            11395,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/in",
        Object {
          "file": 0,
          "key": Array [
            11405,
            11409,
          ],
          "node": Array [
            11405,
            11419,
          ],
          "value": Array [
            11411,
            11419,
          ],
        },
      ],
    ],
  },
  "success": true,
}
`

exports[`src/loaders/file-on-branch.ts TAP > must match snapshot 2`] = `
Object {
  "flattened": Object {
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
          "operationId": "placeOrder",
          "requestBody": Object {
            "content": Object {
              "*/*": Object {
                "schema": Object {
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
          "description": "This can only be done by the logged in user.",
          "operationId": "createUser",
          "requestBody": Object {
            "content": Object {
              "*/*": Object {
                "schema": Object {
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
          "operationId": "createUsersWithArrayInput",
          "requestBody": Object {
            "content": Object {
              "*/*": Object {
                "schema": Object {
                  "items": Object {
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
          "operationId": "createUsersWithListInput",
          "requestBody": Object {
            "content": Object {
              "*/*": Object {
                "schema": Object {
                  "items": Object {
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
  },
  "sourcemap": Object {
    "files": Array [
      Object {
        "index": 0,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/petstore0.json",
      },
    ],
    "map": Array [
      Array [
        "#",
        Object {
          "file": 0,
          "node": Array [
            0,
            18581,
          ],
        },
      ],
      Array [
        "#/openapi",
        Object {
          "file": 0,
          "key": Array [
            4,
            13,
          ],
          "node": Array [
            4,
            22,
          ],
          "value": Array [
            15,
            22,
          ],
        },
      ],
      Array [
        "#/info",
        Object {
          "file": 0,
          "key": Array [
            26,
            32,
          ],
          "node": Array [
            26,
            625,
          ],
          "value": Array [
            34,
            625,
          ],
        },
      ],
      Array [
        "#/info/title",
        Object {
          "file": 0,
          "key": Array [
            40,
            47,
          ],
          "node": Array [
            40,
            67,
          ],
          "value": Array [
            49,
            67,
          ],
        },
      ],
      Array [
        "#/info/description",
        Object {
          "file": 0,
          "key": Array [
            73,
            86,
          ],
          "node": Array [
            73,
            372,
          ],
          "value": Array [
            88,
            372,
          ],
        },
      ],
      Array [
        "#/info/termsOfService",
        Object {
          "file": 0,
          "key": Array [
            378,
            394,
          ],
          "node": Array [
            378,
            422,
          ],
          "value": Array [
            396,
            422,
          ],
        },
      ],
      Array [
        "#/info/contact",
        Object {
          "file": 0,
          "key": Array [
            428,
            437,
          ],
          "node": Array [
            428,
            482,
          ],
          "value": Array [
            439,
            482,
          ],
        },
      ],
      Array [
        "#/info/contact/email",
        Object {
          "file": 0,
          "key": Array [
            447,
            454,
          ],
          "node": Array [
            447,
            476,
          ],
          "value": Array [
            456,
            476,
          ],
        },
      ],
      Array [
        "#/info/license",
        Object {
          "file": 0,
          "key": Array [
            488,
            497,
          ],
          "node": Array [
            488,
            597,
          ],
          "value": Array [
            499,
            597,
          ],
        },
      ],
      Array [
        "#/info/license/name",
        Object {
          "file": 0,
          "key": Array [
            507,
            513,
          ],
          "node": Array [
            507,
            527,
          ],
          "value": Array [
            515,
            527,
          ],
        },
      ],
      Array [
        "#/info/license/url",
        Object {
          "file": 0,
          "key": Array [
            535,
            540,
          ],
          "node": Array [
            535,
            591,
          ],
          "value": Array [
            542,
            591,
          ],
        },
      ],
      Array [
        "#/info/version",
        Object {
          "file": 0,
          "key": Array [
            603,
            612,
          ],
          "node": Array [
            603,
            621,
          ],
          "value": Array [
            614,
            621,
          ],
        },
      ],
      Array [
        "#/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            629,
            643,
          ],
          "node": Array [
            629,
            731,
          ],
          "value": Array [
            645,
            731,
          ],
        },
      ],
      Array [
        "#/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            651,
            664,
          ],
          "node": Array [
            651,
            695,
          ],
          "value": Array [
            666,
            695,
          ],
        },
      ],
      Array [
        "#/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            701,
            706,
          ],
          "node": Array [
            701,
            727,
          ],
          "value": Array [
            708,
            727,
          ],
        },
      ],
      Array [
        "#/servers",
        Object {
          "file": 0,
          "key": Array [
            735,
            744,
          ],
          "node": Array [
            735,
            867,
          ],
          "value": Array [
            746,
            867,
          ],
        },
      ],
      Array [
        "#/servers/0",
        Object {
          "file": 0,
          "node": Array [
            752,
            805,
          ],
        },
      ],
      Array [
        "#/servers/0/url",
        Object {
          "file": 0,
          "key": Array [
            760,
            765,
          ],
          "node": Array [
            760,
            799,
          ],
          "value": Array [
            767,
            799,
          ],
        },
      ],
      Array [
        "#/servers/1",
        Object {
          "file": 0,
          "node": Array [
            811,
            863,
          ],
        },
      ],
      Array [
        "#/servers/1/url",
        Object {
          "file": 0,
          "key": Array [
            819,
            824,
          ],
          "node": Array [
            819,
            857,
          ],
          "value": Array [
            826,
            857,
          ],
        },
      ],
      Array [
        "#/tags",
        Object {
          "file": 0,
          "key": Array [
            871,
            877,
          ],
          "node": Array [
            871,
            1364,
          ],
          "value": Array [
            879,
            1364,
          ],
        },
      ],
      Array [
        "#/tags/0",
        Object {
          "file": 0,
          "node": Array [
            885,
            1071,
          ],
        },
      ],
      Array [
        "#/tags/0/name",
        Object {
          "file": 0,
          "key": Array [
            893,
            899,
          ],
          "node": Array [
            893,
            906,
          ],
          "value": Array [
            901,
            906,
          ],
        },
      ],
      Array [
        "#/tags/0/description",
        Object {
          "file": 0,
          "key": Array [
            914,
            927,
          ],
          "node": Array [
            914,
            957,
          ],
          "value": Array [
            929,
            957,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            965,
            979,
          ],
          "node": Array [
            965,
            1065,
          ],
          "value": Array [
            981,
            1065,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            991,
            1004,
          ],
          "node": Array [
            991,
            1021,
          ],
          "value": Array [
            1006,
            1021,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            1031,
            1036,
          ],
          "node": Array [
            1031,
            1057,
          ],
          "value": Array [
            1038,
            1057,
          ],
        },
      ],
      Array [
        "#/tags/1",
        Object {
          "file": 0,
          "node": Array [
            1077,
            1156,
          ],
        },
      ],
      Array [
        "#/tags/1/name",
        Object {
          "file": 0,
          "key": Array [
            1085,
            1091,
          ],
          "node": Array [
            1085,
            1100,
          ],
          "value": Array [
            1093,
            1100,
          ],
        },
      ],
      Array [
        "#/tags/1/description",
        Object {
          "file": 0,
          "key": Array [
            1108,
            1121,
          ],
          "node": Array [
            1108,
            1150,
          ],
          "value": Array [
            1123,
            1150,
          ],
        },
      ],
      Array [
        "#/tags/2",
        Object {
          "file": 0,
          "node": Array [
            1162,
            1360,
          ],
        },
      ],
      Array [
        "#/tags/2/name",
        Object {
          "file": 0,
          "key": Array [
            1170,
            1176,
          ],
          "node": Array [
            1170,
            1184,
          ],
          "value": Array [
            1178,
            1184,
          ],
        },
      ],
      Array [
        "#/tags/2/description",
        Object {
          "file": 0,
          "key": Array [
            1192,
            1205,
          ],
          "node": Array [
            1192,
            1230,
          ],
          "value": Array [
            1207,
            1230,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs",
        Object {
          "file": 0,
          "key": Array [
            1238,
            1252,
          ],
          "node": Array [
            1238,
            1354,
          ],
          "value": Array [
            1254,
            1354,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/description",
        Object {
          "file": 0,
          "key": Array [
            1264,
            1277,
          ],
          "node": Array [
            1264,
            1310,
          ],
          "value": Array [
            1279,
            1310,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/url",
        Object {
          "file": 0,
          "key": Array [
            1320,
            1325,
          ],
          "node": Array [
            1320,
            1346,
          ],
          "value": Array [
            1327,
            1346,
          ],
        },
      ],
      Array [
        "#/paths",
        Object {
          "file": 0,
          "key": Array [
            1368,
            1375,
          ],
          "node": Array [
            1368,
            14363,
          ],
          "value": Array [
            1377,
            14363,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema",
        Object {
          "file": 0,
          "key": Array [
            17788,
            17801,
          ],
          "node": Array [
            17788,
            18092,
          ],
          "value": Array [
            17803,
            18092,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/type",
        Object {
          "file": 0,
          "key": Array [
            17813,
            17819,
          ],
          "node": Array [
            17813,
            17829,
          ],
          "value": Array [
            17821,
            17829,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties",
        Object {
          "file": 0,
          "key": Array [
            17839,
            17851,
          ],
          "node": Array [
            17839,
            18084,
          ],
          "value": Array [
            17853,
            18084,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code",
        Object {
          "file": 0,
          "key": Array [
            17865,
            17871,
          ],
          "node": Array [
            17865,
            17947,
          ],
          "value": Array [
            17873,
            17947,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code/type",
        Object {
          "file": 0,
          "key": Array [
            17887,
            17893,
          ],
          "node": Array [
            17887,
            17904,
          ],
          "value": Array [
            17895,
            17904,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code/format",
        Object {
          "file": 0,
          "key": Array [
            17918,
            17926,
          ],
          "node": Array [
            17918,
            17935,
          ],
          "value": Array [
            17928,
            17935,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/type",
        Object {
          "file": 0,
          "key": Array [
            17959,
            17965,
          ],
          "node": Array [
            17959,
            18009,
          ],
          "value": Array [
            17967,
            18009,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/type/type",
        Object {
          "file": 0,
          "key": Array [
            17981,
            17987,
          ],
          "node": Array [
            17981,
            17997,
          ],
          "value": Array [
            17989,
            17997,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/message",
        Object {
          "file": 0,
          "key": Array [
            18021,
            18030,
          ],
          "node": Array [
            18021,
            18074,
          ],
          "value": Array [
            18032,
            18074,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/message/type",
        Object {
          "file": 0,
          "key": Array [
            18046,
            18052,
          ],
          "node": Array [
            18046,
            18062,
          ],
          "value": Array [
            18054,
            18062,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory",
        Object {
          "file": 0,
          "key": Array [
            2899,
            2917,
          ],
          "node": Array [
            2899,
            3673,
          ],
          "value": Array [
            2919,
            3673,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get",
        Object {
          "file": 0,
          "key": Array [
            2927,
            2932,
          ],
          "node": Array [
            2927,
            3667,
          ],
          "value": Array [
            2934,
            3667,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/tags",
        Object {
          "file": 0,
          "key": Array [
            2944,
            2950,
          ],
          "node": Array [
            2944,
            2981,
          ],
          "value": Array [
            2952,
            2981,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/tags/0",
        Object {
          "file": 0,
          "node": Array [
            2964,
            2971,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/summary",
        Object {
          "file": 0,
          "key": Array [
            2991,
            3000,
          ],
          "node": Array [
            2991,
            3037,
          ],
          "value": Array [
            3002,
            3037,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/description",
        Object {
          "file": 0,
          "key": Array [
            3047,
            3060,
          ],
          "node": Array [
            3047,
            3107,
          ],
          "value": Array [
            3062,
            3107,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/operationId",
        Object {
          "file": 0,
          "key": Array [
            3117,
            3130,
          ],
          "node": Array [
            3117,
            3146,
          ],
          "value": Array [
            3132,
            3146,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses",
        Object {
          "file": 0,
          "key": Array [
            3156,
            3167,
          ],
          "node": Array [
            3156,
            3576,
          ],
          "value": Array [
            3169,
            3576,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200",
        Object {
          "file": 0,
          "key": Array [
            3181,
            3186,
          ],
          "node": Array [
            3181,
            3566,
          ],
          "value": Array [
            3188,
            3566,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/description",
        Object {
          "file": 0,
          "key": Array [
            3202,
            3215,
          ],
          "node": Array [
            3202,
            3239,
          ],
          "value": Array [
            3217,
            3239,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content",
        Object {
          "file": 0,
          "key": Array [
            3253,
            3262,
          ],
          "node": Array [
            3253,
            3554,
          ],
          "value": Array [
            3264,
            3554,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json",
        Object {
          "file": 0,
          "key": Array [
            3280,
            3298,
          ],
          "node": Array [
            3280,
            3540,
          ],
          "value": Array [
            3300,
            3540,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json/schema",
        Object {
          "file": 0,
          "key": Array [
            3318,
            3326,
          ],
          "node": Array [
            3318,
            3524,
          ],
          "value": Array [
            3328,
            3524,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json/schema/type",
        Object {
          "file": 0,
          "key": Array [
            3348,
            3354,
          ],
          "node": Array [
            3348,
            3364,
          ],
          "value": Array [
            3356,
            3364,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json/schema/additionalProperties",
        Object {
          "file": 0,
          "key": Array [
            3384,
            3406,
          ],
          "node": Array [
            3384,
            3506,
          ],
          "value": Array [
            3408,
            3506,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json/schema/additionalProperties/type",
        Object {
          "file": 0,
          "key": Array [
            3430,
            3436,
          ],
          "node": Array [
            3430,
            3447,
          ],
          "value": Array [
            3438,
            3447,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/responses/200/content/application~1json/schema/additionalProperties/format",
        Object {
          "file": 0,
          "key": Array [
            3469,
            3477,
          ],
          "node": Array [
            3469,
            3486,
          ],
          "value": Array [
            3479,
            3486,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/security",
        Object {
          "file": 0,
          "key": Array [
            3586,
            3596,
          ],
          "node": Array [
            3586,
            3659,
          ],
          "value": Array [
            3598,
            3659,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/security/0",
        Object {
          "file": 0,
          "node": Array [
            3610,
            3649,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1inventory/get/security/0/api_key",
        Object {
          "file": 0,
          "key": Array [
            3624,
            3633,
          ],
          "node": Array [
            3624,
            3637,
          ],
          "value": Array [
            3635,
            3637,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order",
        Object {
          "file": 0,
          "key": Array [
            3679,
            3693,
          ],
          "node": Array [
            3679,
            4759,
          ],
          "value": Array [
            3695,
            4759,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post",
        Object {
          "file": 0,
          "key": Array [
            3703,
            3709,
          ],
          "node": Array [
            3703,
            4753,
          ],
          "value": Array [
            3711,
            4753,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/tags",
        Object {
          "file": 0,
          "key": Array [
            3721,
            3727,
          ],
          "node": Array [
            3721,
            3758,
          ],
          "value": Array [
            3729,
            3758,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/tags/0",
        Object {
          "file": 0,
          "node": Array [
            3741,
            3748,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/summary",
        Object {
          "file": 0,
          "key": Array [
            3768,
            3777,
          ],
          "node": Array [
            3768,
            3805,
          ],
          "value": Array [
            3779,
            3805,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/operationId",
        Object {
          "file": 0,
          "key": Array [
            3815,
            3828,
          ],
          "node": Array [
            3815,
            3842,
          ],
          "value": Array [
            3830,
            3842,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody",
        Object {
          "file": 0,
          "key": Array [
            3852,
            3865,
          ],
          "node": Array [
            3852,
            4135,
          ],
          "value": Array [
            3867,
            4135,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/description",
        Object {
          "file": 0,
          "key": Array [
            3879,
            3892,
          ],
          "node": Array [
            3879,
            3931,
          ],
          "value": Array [
            3894,
            3931,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content",
        Object {
          "file": 0,
          "key": Array [
            3943,
            3952,
          ],
          "node": Array [
            3943,
            4097,
          ],
          "value": Array [
            3954,
            4097,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*",
        Object {
          "file": 0,
          "key": Array [
            3968,
            3973,
          ],
          "node": Array [
            3968,
            4085,
          ],
          "value": Array [
            3975,
            4085,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema",
        Object {
          "file": 0,
          "key": Array [
            14406,
            14413,
          ],
          "node": Array [
            14406,
            15240,
          ],
          "value": Array [
            14415,
            15240,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/type",
        Object {
          "file": 0,
          "key": Array [
            14425,
            14431,
          ],
          "node": Array [
            14425,
            14441,
          ],
          "value": Array [
            14433,
            14441,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties",
        Object {
          "file": 0,
          "key": Array [
            14451,
            14463,
          ],
          "node": Array [
            14451,
            15178,
          ],
          "value": Array [
            14465,
            15178,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id",
        Object {
          "file": 0,
          "key": Array [
            14477,
            14481,
          ],
          "node": Array [
            14477,
            14557,
          ],
          "value": Array [
            14483,
            14557,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            14497,
            14503,
          ],
          "node": Array [
            14497,
            14514,
          ],
          "value": Array [
            14505,
            14514,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            14528,
            14536,
          ],
          "node": Array [
            14528,
            14545,
          ],
          "value": Array [
            14538,
            14545,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId",
        Object {
          "file": 0,
          "key": Array [
            14569,
            14576,
          ],
          "node": Array [
            14569,
            14652,
          ],
          "value": Array [
            14578,
            14652,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId/type",
        Object {
          "file": 0,
          "key": Array [
            14592,
            14598,
          ],
          "node": Array [
            14592,
            14609,
          ],
          "value": Array [
            14600,
            14609,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId/format",
        Object {
          "file": 0,
          "key": Array [
            14623,
            14631,
          ],
          "node": Array [
            14623,
            14640,
          ],
          "value": Array [
            14633,
            14640,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity",
        Object {
          "file": 0,
          "key": Array [
            14664,
            14674,
          ],
          "node": Array [
            14664,
            14750,
          ],
          "value": Array [
            14676,
            14750,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity/type",
        Object {
          "file": 0,
          "key": Array [
            14690,
            14696,
          ],
          "node": Array [
            14690,
            14707,
          ],
          "value": Array [
            14698,
            14707,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity/format",
        Object {
          "file": 0,
          "key": Array [
            14721,
            14729,
          ],
          "node": Array [
            14721,
            14738,
          ],
          "value": Array [
            14731,
            14738,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate",
        Object {
          "file": 0,
          "key": Array [
            14762,
            14772,
          ],
          "node": Array [
            14762,
            14851,
          ],
          "value": Array [
            14774,
            14851,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate/type",
        Object {
          "file": 0,
          "key": Array [
            14788,
            14794,
          ],
          "node": Array [
            14788,
            14804,
          ],
          "value": Array [
            14796,
            14804,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate/format",
        Object {
          "file": 0,
          "key": Array [
            14818,
            14826,
          ],
          "node": Array [
            14818,
            14839,
          ],
          "value": Array [
            14828,
            14839,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status",
        Object {
          "file": 0,
          "key": Array [
            14863,
            14871,
          ],
          "node": Array [
            14863,
            15071,
          ],
          "value": Array [
            14873,
            15071,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/type",
        Object {
          "file": 0,
          "key": Array [
            14887,
            14893,
          ],
          "node": Array [
            14887,
            14903,
          ],
          "value": Array [
            14895,
            14903,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/description",
        Object {
          "file": 0,
          "key": Array [
            14917,
            14930,
          ],
          "node": Array [
            14917,
            14946,
          ],
          "value": Array [
            14932,
            14946,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum",
        Object {
          "file": 0,
          "key": Array [
            14960,
            14966,
          ],
          "node": Array [
            14960,
            15059,
          ],
          "value": Array [
            14968,
            15059,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/0",
        Object {
          "file": 0,
          "node": Array [
            14984,
            14992,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/1",
        Object {
          "file": 0,
          "node": Array [
            15008,
            15018,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/2",
        Object {
          "file": 0,
          "node": Array [
            15034,
            15045,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete",
        Object {
          "file": 0,
          "key": Array [
            15083,
            15093,
          ],
          "node": Array [
            15083,
            15168,
          ],
          "value": Array [
            15095,
            15168,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete/type",
        Object {
          "file": 0,
          "key": Array [
            15109,
            15115,
          ],
          "node": Array [
            15109,
            15126,
          ],
          "value": Array [
            15117,
            15126,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete/default",
        Object {
          "file": 0,
          "key": Array [
            15140,
            15149,
          ],
          "node": Array [
            15140,
            15156,
          ],
          "value": Array [
            15151,
            15156,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/xml",
        Object {
          "file": 0,
          "key": Array [
            15188,
            15193,
          ],
          "node": Array [
            15188,
            15232,
          ],
          "value": Array [
            15195,
            15232,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/xml/name",
        Object {
          "file": 0,
          "key": Array [
            15207,
            15213,
          ],
          "node": Array [
            15207,
            15222,
          ],
          "value": Array [
            15215,
            15222,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/required",
        Object {
          "file": 0,
          "key": Array [
            4109,
            4119,
          ],
          "node": Array [
            4109,
            4125,
          ],
          "value": Array [
            4121,
            4125,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses",
        Object {
          "file": 0,
          "key": Array [
            4145,
            4156,
          ],
          "node": Array [
            4145,
            4698,
          ],
          "value": Array [
            4158,
            4698,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/200",
        Object {
          "file": 0,
          "key": Array [
            4170,
            4175,
          ],
          "node": Array [
            4170,
            4586,
          ],
          "value": Array [
            4177,
            4586,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/200/description",
        Object {
          "file": 0,
          "key": Array [
            4191,
            4204,
          ],
          "node": Array [
            4191,
            4228,
          ],
          "value": Array [
            4206,
            4228,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/200/content",
        Object {
          "file": 0,
          "key": Array [
            4242,
            4251,
          ],
          "node": Array [
            4242,
            4574,
          ],
          "value": Array [
            4253,
            4574,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/200/content/application~1xml",
        Object {
          "file": 0,
          "key": Array [
            4269,
            4286,
          ],
          "node": Array [
            4269,
            4406,
          ],
          "value": Array [
            4288,
            4406,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/200/content/application~1json",
        Object {
          "file": 0,
          "key": Array [
            4422,
            4440,
          ],
          "node": Array [
            4422,
            4560,
          ],
          "value": Array [
            4442,
            4560,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/400",
        Object {
          "file": 0,
          "key": Array [
            4598,
            4603,
          ],
          "node": Array [
            4598,
            4688,
          ],
          "value": Array [
            4605,
            4688,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/400/description",
        Object {
          "file": 0,
          "key": Array [
            4619,
            4632,
          ],
          "node": Array [
            4619,
            4649,
          ],
          "value": Array [
            4634,
            4649,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/responses/400/content",
        Object {
          "file": 0,
          "key": Array [
            4663,
            4672,
          ],
          "node": Array [
            4663,
            4676,
          ],
          "value": Array [
            4674,
            4676,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/x-codegen-request-body-name",
        Object {
          "file": 0,
          "key": Array [
            4708,
            4737,
          ],
          "node": Array [
            4708,
            4745,
          ],
          "value": Array [
            4739,
            4745,
          ],
        },
      ],
      Array [
        "#/paths/~1user",
        Object {
          "file": 0,
          "key": Array [
            7047,
            7054,
          ],
          "node": Array [
            7047,
            7743,
          ],
          "value": Array [
            7056,
            7743,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post",
        Object {
          "file": 0,
          "key": Array [
            7064,
            7070,
          ],
          "node": Array [
            7064,
            7737,
          ],
          "value": Array [
            7072,
            7737,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/tags",
        Object {
          "file": 0,
          "key": Array [
            7082,
            7088,
          ],
          "node": Array [
            7082,
            7118,
          ],
          "value": Array [
            7090,
            7118,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/tags/0",
        Object {
          "file": 0,
          "node": Array [
            7102,
            7108,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/summary",
        Object {
          "file": 0,
          "key": Array [
            7128,
            7137,
          ],
          "node": Array [
            7128,
            7152,
          ],
          "value": Array [
            7139,
            7152,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/description",
        Object {
          "file": 0,
          "key": Array [
            7162,
            7175,
          ],
          "node": Array [
            7162,
            7223,
          ],
          "value": Array [
            7177,
            7223,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/operationId",
        Object {
          "file": 0,
          "key": Array [
            7233,
            7246,
          ],
          "node": Array [
            7233,
            7260,
          ],
          "value": Array [
            7248,
            7260,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody",
        Object {
          "file": 0,
          "key": Array [
            7270,
            7283,
          ],
          "node": Array [
            7270,
            7536,
          ],
          "value": Array [
            7285,
            7536,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/description",
        Object {
          "file": 0,
          "key": Array [
            7297,
            7310,
          ],
          "node": Array [
            7297,
            7333,
          ],
          "value": Array [
            7312,
            7333,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content",
        Object {
          "file": 0,
          "key": Array [
            7345,
            7354,
          ],
          "node": Array [
            7345,
            7498,
          ],
          "value": Array [
            7356,
            7498,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*",
        Object {
          "file": 0,
          "key": Array [
            7370,
            7375,
          ],
          "node": Array [
            7370,
            7486,
          ],
          "value": Array [
            7377,
            7486,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema",
        Object {
          "file": 0,
          "key": Array [
            15547,
            15553,
          ],
          "node": Array [
            15547,
            16301,
          ],
          "value": Array [
            15555,
            16301,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/type",
        Object {
          "file": 0,
          "key": Array [
            15565,
            15571,
          ],
          "node": Array [
            15565,
            15581,
          ],
          "value": Array [
            15573,
            15581,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties",
        Object {
          "file": 0,
          "key": Array [
            15591,
            15603,
          ],
          "node": Array [
            15591,
            16240,
          ],
          "value": Array [
            15605,
            16240,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id",
        Object {
          "file": 0,
          "key": Array [
            15617,
            15621,
          ],
          "node": Array [
            15617,
            15697,
          ],
          "value": Array [
            15623,
            15697,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            15637,
            15643,
          ],
          "node": Array [
            15637,
            15654,
          ],
          "value": Array [
            15645,
            15654,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            15668,
            15676,
          ],
          "node": Array [
            15668,
            15685,
          ],
          "value": Array [
            15678,
            15685,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/username",
        Object {
          "file": 0,
          "key": Array [
            15709,
            15719,
          ],
          "node": Array [
            15709,
            15763,
          ],
          "value": Array [
            15721,
            15763,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/username/type",
        Object {
          "file": 0,
          "key": Array [
            15735,
            15741,
          ],
          "node": Array [
            15735,
            15751,
          ],
          "value": Array [
            15743,
            15751,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName",
        Object {
          "file": 0,
          "key": Array [
            15775,
            15786,
          ],
          "node": Array [
            15775,
            15830,
          ],
          "value": Array [
            15788,
            15830,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName/type",
        Object {
          "file": 0,
          "key": Array [
            15802,
            15808,
          ],
          "node": Array [
            15802,
            15818,
          ],
          "value": Array [
            15810,
            15818,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName",
        Object {
          "file": 0,
          "key": Array [
            15842,
            15852,
          ],
          "node": Array [
            15842,
            15896,
          ],
          "value": Array [
            15854,
            15896,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName/type",
        Object {
          "file": 0,
          "key": Array [
            15868,
            15874,
          ],
          "node": Array [
            15868,
            15884,
          ],
          "value": Array [
            15876,
            15884,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/email",
        Object {
          "file": 0,
          "key": Array [
            15908,
            15915,
          ],
          "node": Array [
            15908,
            15959,
          ],
          "value": Array [
            15917,
            15959,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/email/type",
        Object {
          "file": 0,
          "key": Array [
            15931,
            15937,
          ],
          "node": Array [
            15931,
            15947,
          ],
          "value": Array [
            15939,
            15947,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/password",
        Object {
          "file": 0,
          "key": Array [
            15971,
            15981,
          ],
          "node": Array [
            15971,
            16025,
          ],
          "value": Array [
            15983,
            16025,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/password/type",
        Object {
          "file": 0,
          "key": Array [
            15997,
            16003,
          ],
          "node": Array [
            15997,
            16013,
          ],
          "value": Array [
            16005,
            16013,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone",
        Object {
          "file": 0,
          "key": Array [
            16037,
            16044,
          ],
          "node": Array [
            16037,
            16088,
          ],
          "value": Array [
            16046,
            16088,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone/type",
        Object {
          "file": 0,
          "key": Array [
            16060,
            16066,
          ],
          "node": Array [
            16060,
            16076,
          ],
          "value": Array [
            16068,
            16076,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus",
        Object {
          "file": 0,
          "key": Array [
            16100,
            16112,
          ],
          "node": Array [
            16100,
            16230,
          ],
          "value": Array [
            16114,
            16230,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/type",
        Object {
          "file": 0,
          "key": Array [
            16128,
            16134,
          ],
          "node": Array [
            16128,
            16145,
          ],
          "value": Array [
            16136,
            16145,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/description",
        Object {
          "file": 0,
          "key": Array [
            16159,
            16172,
          ],
          "node": Array [
            16159,
            16187,
          ],
          "value": Array [
            16174,
            16187,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/format",
        Object {
          "file": 0,
          "key": Array [
            16201,
            16209,
          ],
          "node": Array [
            16201,
            16218,
          ],
          "value": Array [
            16211,
            16218,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/xml",
        Object {
          "file": 0,
          "key": Array [
            16250,
            16255,
          ],
          "node": Array [
            16250,
            16293,
          ],
          "value": Array [
            16257,
            16293,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/xml/name",
        Object {
          "file": 0,
          "key": Array [
            16269,
            16275,
          ],
          "node": Array [
            16269,
            16283,
          ],
          "value": Array [
            16277,
            16283,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/required",
        Object {
          "file": 0,
          "key": Array [
            7510,
            7520,
          ],
          "node": Array [
            7510,
            7526,
          ],
          "value": Array [
            7522,
            7526,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/responses",
        Object {
          "file": 0,
          "key": Array [
            7546,
            7557,
          ],
          "node": Array [
            7546,
            7682,
          ],
          "value": Array [
            7559,
            7682,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/responses/default",
        Object {
          "file": 0,
          "key": Array [
            7571,
            7580,
          ],
          "node": Array [
            7571,
            7672,
          ],
          "value": Array [
            7582,
            7672,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            7596,
            7609,
          ],
          "node": Array [
            7596,
            7633,
          ],
          "value": Array [
            7611,
            7633,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            7647,
            7656,
          ],
          "node": Array [
            7647,
            7660,
          ],
          "value": Array [
            7658,
            7660,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/x-codegen-request-body-name",
        Object {
          "file": 0,
          "key": Array [
            7692,
            7721,
          ],
          "node": Array [
            7692,
            7729,
          ],
          "value": Array [
            7723,
            7729,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray",
        Object {
          "file": 0,
          "key": Array [
            7749,
            7772,
          ],
          "node": Array [
            7749,
            8518,
          ],
          "value": Array [
            7774,
            8518,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post",
        Object {
          "file": 0,
          "key": Array [
            7782,
            7788,
          ],
          "node": Array [
            7782,
            8512,
          ],
          "value": Array [
            7790,
            8512,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/tags",
        Object {
          "file": 0,
          "key": Array [
            7800,
            7806,
          ],
          "node": Array [
            7800,
            7836,
          ],
          "value": Array [
            7808,
            7836,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/tags/0",
        Object {
          "file": 0,
          "node": Array [
            7820,
            7826,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/summary",
        Object {
          "file": 0,
          "key": Array [
            7846,
            7855,
          ],
          "node": Array [
            7846,
            7903,
          ],
          "value": Array [
            7857,
            7903,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/operationId",
        Object {
          "file": 0,
          "key": Array [
            7913,
            7926,
          ],
          "node": Array [
            7913,
            7955,
          ],
          "value": Array [
            7928,
            7955,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody",
        Object {
          "file": 0,
          "key": Array [
            7965,
            7978,
          ],
          "node": Array [
            7965,
            8311,
          ],
          "value": Array [
            7980,
            8311,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/description",
        Object {
          "file": 0,
          "key": Array [
            7992,
            8005,
          ],
          "node": Array [
            7992,
            8028,
          ],
          "value": Array [
            8007,
            8028,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/content",
        Object {
          "file": 0,
          "key": Array [
            8040,
            8049,
          ],
          "node": Array [
            8040,
            8273,
          ],
          "value": Array [
            8051,
            8273,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/content/*~1*",
        Object {
          "file": 0,
          "key": Array [
            8065,
            8070,
          ],
          "node": Array [
            8065,
            8261,
          ],
          "value": Array [
            8072,
            8261,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema",
        Object {
          "file": 0,
          "key": Array [
            8088,
            8096,
          ],
          "node": Array [
            8088,
            8247,
          ],
          "value": Array [
            8098,
            8247,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/type",
        Object {
          "file": 0,
          "key": Array [
            8116,
            8122,
          ],
          "node": Array [
            8116,
            8131,
          ],
          "value": Array [
            8124,
            8131,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/requestBody/required",
        Object {
          "file": 0,
          "key": Array [
            8285,
            8295,
          ],
          "node": Array [
            8285,
            8301,
          ],
          "value": Array [
            8297,
            8301,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/responses",
        Object {
          "file": 0,
          "key": Array [
            8321,
            8332,
          ],
          "node": Array [
            8321,
            8457,
          ],
          "value": Array [
            8334,
            8457,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/responses/default",
        Object {
          "file": 0,
          "key": Array [
            8346,
            8355,
          ],
          "node": Array [
            8346,
            8447,
          ],
          "value": Array [
            8357,
            8447,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            8371,
            8384,
          ],
          "node": Array [
            8371,
            8408,
          ],
          "value": Array [
            8386,
            8408,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            8422,
            8431,
          ],
          "node": Array [
            8422,
            8435,
          ],
          "value": Array [
            8433,
            8435,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithArray/post/x-codegen-request-body-name",
        Object {
          "file": 0,
          "key": Array [
            8467,
            8496,
          ],
          "node": Array [
            8467,
            8504,
          ],
          "value": Array [
            8498,
            8504,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList",
        Object {
          "file": 0,
          "key": Array [
            8524,
            8546,
          ],
          "node": Array [
            8524,
            9291,
          ],
          "value": Array [
            8548,
            9291,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post",
        Object {
          "file": 0,
          "key": Array [
            8556,
            8562,
          ],
          "node": Array [
            8556,
            9285,
          ],
          "value": Array [
            8564,
            9285,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags",
        Object {
          "file": 0,
          "key": Array [
            8574,
            8580,
          ],
          "node": Array [
            8574,
            8610,
          ],
          "value": Array [
            8582,
            8610,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags/0",
        Object {
          "file": 0,
          "node": Array [
            8594,
            8600,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/summary",
        Object {
          "file": 0,
          "key": Array [
            8620,
            8629,
          ],
          "node": Array [
            8620,
            8677,
          ],
          "value": Array [
            8631,
            8677,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/operationId",
        Object {
          "file": 0,
          "key": Array [
            8687,
            8700,
          ],
          "node": Array [
            8687,
            8728,
          ],
          "value": Array [
            8702,
            8728,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody",
        Object {
          "file": 0,
          "key": Array [
            8738,
            8751,
          ],
          "node": Array [
            8738,
            9084,
          ],
          "value": Array [
            8753,
            9084,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/description",
        Object {
          "file": 0,
          "key": Array [
            8765,
            8778,
          ],
          "node": Array [
            8765,
            8801,
          ],
          "value": Array [
            8780,
            8801,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content",
        Object {
          "file": 0,
          "key": Array [
            8813,
            8822,
          ],
          "node": Array [
            8813,
            9046,
          ],
          "value": Array [
            8824,
            9046,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*",
        Object {
          "file": 0,
          "key": Array [
            8838,
            8843,
          ],
          "node": Array [
            8838,
            9034,
          ],
          "value": Array [
            8845,
            9034,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema",
        Object {
          "file": 0,
          "key": Array [
            8861,
            8869,
          ],
          "node": Array [
            8861,
            9020,
          ],
          "value": Array [
            8871,
            9020,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/type",
        Object {
          "file": 0,
          "key": Array [
            8889,
            8895,
          ],
          "node": Array [
            8889,
            8904,
          ],
          "value": Array [
            8897,
            8904,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/required",
        Object {
          "file": 0,
          "key": Array [
            9058,
            9068,
          ],
          "node": Array [
            9058,
            9074,
          ],
          "value": Array [
            9070,
            9074,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses",
        Object {
          "file": 0,
          "key": Array [
            9094,
            9105,
          ],
          "node": Array [
            9094,
            9230,
          ],
          "value": Array [
            9107,
            9230,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default",
        Object {
          "file": 0,
          "key": Array [
            9119,
            9128,
          ],
          "node": Array [
            9119,
            9220,
          ],
          "value": Array [
            9130,
            9220,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            9144,
            9157,
          ],
          "node": Array [
            9144,
            9181,
          ],
          "value": Array [
            9159,
            9181,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            9195,
            9204,
          ],
          "node": Array [
            9195,
            9208,
          ],
          "value": Array [
            9206,
            9208,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/x-codegen-request-body-name",
        Object {
          "file": 0,
          "key": Array [
            9240,
            9269,
          ],
          "node": Array [
            9240,
            9277,
          ],
          "value": Array [
            9271,
            9277,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login",
        Object {
          "file": 0,
          "key": Array [
            9297,
            9310,
          ],
          "node": Array [
            9297,
            11051,
          ],
          "value": Array [
            9312,
            11051,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get",
        Object {
          "file": 0,
          "key": Array [
            9320,
            9325,
          ],
          "node": Array [
            9320,
            11045,
          ],
          "value": Array [
            9327,
            11045,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags",
        Object {
          "file": 0,
          "key": Array [
            9337,
            9343,
          ],
          "node": Array [
            9337,
            9373,
          ],
          "value": Array [
            9345,
            9373,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags/0",
        Object {
          "file": 0,
          "node": Array [
            9357,
            9363,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/summary",
        Object {
          "file": 0,
          "key": Array [
            9383,
            9392,
          ],
          "node": Array [
            9383,
            9421,
          ],
          "value": Array [
            9394,
            9421,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/operationId",
        Object {
          "file": 0,
          "key": Array [
            9431,
            9444,
          ],
          "node": Array [
            9431,
            9457,
          ],
          "value": Array [
            9446,
            9457,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters",
        Object {
          "file": 0,
          "key": Array [
            9467,
            9479,
          ],
          "node": Array [
            9467,
            9978,
          ],
          "value": Array [
            9481,
            9978,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0",
        Object {
          "file": 0,
          "node": Array [
            9493,
            9718,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/name",
        Object {
          "file": 0,
          "key": Array [
            9507,
            9513,
          ],
          "node": Array [
            9507,
            9525,
          ],
          "value": Array [
            9515,
            9525,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/in",
        Object {
          "file": 0,
          "key": Array [
            9539,
            9543,
          ],
          "node": Array [
            9539,
            9552,
          ],
          "value": Array [
            9545,
            9552,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/description",
        Object {
          "file": 0,
          "key": Array [
            9566,
            9579,
          ],
          "node": Array [
            9566,
            9606,
          ],
          "value": Array [
            9581,
            9606,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/required",
        Object {
          "file": 0,
          "key": Array [
            9620,
            9630,
          ],
          "node": Array [
            9620,
            9636,
          ],
          "value": Array [
            9632,
            9636,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema",
        Object {
          "file": 0,
          "key": Array [
            9650,
            9658,
          ],
          "node": Array [
            9650,
            9706,
          ],
          "value": Array [
            9660,
            9706,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema/type",
        Object {
          "file": 0,
          "key": Array [
            9676,
            9682,
          ],
          "node": Array [
            9676,
            9692,
          ],
          "value": Array [
            9684,
            9692,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1",
        Object {
          "file": 0,
          "node": Array [
            9730,
            9968,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/name",
        Object {
          "file": 0,
          "key": Array [
            9744,
            9750,
          ],
          "node": Array [
            9744,
            9762,
          ],
          "value": Array [
            9752,
            9762,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/in",
        Object {
          "file": 0,
          "key": Array [
            9776,
            9780,
          ],
          "node": Array [
            9776,
            9789,
          ],
          "value": Array [
            9782,
            9789,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/description",
        Object {
          "file": 0,
          "key": Array [
            9803,
            9816,
          ],
          "node": Array [
            9803,
            9856,
          ],
          "value": Array [
            9818,
            9856,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/required",
        Object {
          "file": 0,
          "key": Array [
            9870,
            9880,
          ],
          "node": Array [
            9870,
            9886,
          ],
          "value": Array [
            9882,
            9886,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema",
        Object {
          "file": 0,
          "key": Array [
            9900,
            9908,
          ],
          "node": Array [
            9900,
            9956,
          ],
          "value": Array [
            9910,
            9956,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema/type",
        Object {
          "file": 0,
          "key": Array [
            9926,
            9932,
          ],
          "node": Array [
            9926,
            9942,
          ],
          "value": Array [
            9934,
            9942,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses",
        Object {
          "file": 0,
          "key": Array [
            9988,
            9999,
          ],
          "node": Array [
            9988,
            11037,
          ],
          "value": Array [
            10001,
            11037,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200",
        Object {
          "file": 0,
          "key": Array [
            10013,
            10018,
          ],
          "node": Array [
            10013,
            10904,
          ],
          "value": Array [
            10020,
            10904,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/description",
        Object {
          "file": 0,
          "key": Array [
            10034,
            10047,
          ],
          "node": Array [
            10034,
            10071,
          ],
          "value": Array [
            10049,
            10071,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers",
        Object {
          "file": 0,
          "key": Array [
            10085,
            10094,
          ],
          "node": Array [
            10085,
            10586,
          ],
          "value": Array [
            10096,
            10586,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit",
        Object {
          "file": 0,
          "key": Array [
            10112,
            10126,
          ],
          "node": Array [
            10112,
            10333,
          ],
          "value": Array [
            10128,
            10333,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/description",
        Object {
          "file": 0,
          "key": Array [
            10146,
            10159,
          ],
          "node": Array [
            10146,
            10197,
          ],
          "value": Array [
            10161,
            10197,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema",
        Object {
          "file": 0,
          "key": Array [
            10215,
            10223,
          ],
          "node": Array [
            10215,
            10317,
          ],
          "value": Array [
            10225,
            10317,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema/type",
        Object {
          "file": 0,
          "key": Array [
            10245,
            10251,
          ],
          "node": Array [
            10245,
            10262,
          ],
          "value": Array [
            10253,
            10262,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit/schema/format",
        Object {
          "file": 0,
          "key": Array [
            10282,
            10290,
          ],
          "node": Array [
            10282,
            10299,
          ],
          "value": Array [
            10292,
            10299,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After",
        Object {
          "file": 0,
          "key": Array [
            10349,
            10366,
          ],
          "node": Array [
            10349,
            10572,
          ],
          "value": Array [
            10368,
            10572,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/description",
        Object {
          "file": 0,
          "key": Array [
            10386,
            10399,
          ],
          "node": Array [
            10386,
            10433,
          ],
          "value": Array [
            10401,
            10433,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema",
        Object {
          "file": 0,
          "key": Array [
            10451,
            10459,
          ],
          "node": Array [
            10451,
            10556,
          ],
          "value": Array [
            10461,
            10556,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema/type",
        Object {
          "file": 0,
          "key": Array [
            10481,
            10487,
          ],
          "node": Array [
            10481,
            10497,
          ],
          "value": Array [
            10489,
            10497,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/headers/X-Expires-After/schema/format",
        Object {
          "file": 0,
          "key": Array [
            10517,
            10525,
          ],
          "node": Array [
            10517,
            10538,
          ],
          "value": Array [
            10527,
            10538,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content",
        Object {
          "file": 0,
          "key": Array [
            10600,
            10609,
          ],
          "node": Array [
            10600,
            10892,
          ],
          "value": Array [
            10611,
            10892,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml",
        Object {
          "file": 0,
          "key": Array [
            10627,
            10644,
          ],
          "node": Array [
            10627,
            10744,
          ],
          "value": Array [
            10646,
            10744,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml/schema",
        Object {
          "file": 0,
          "key": Array [
            10664,
            10672,
          ],
          "node": Array [
            10664,
            10728,
          ],
          "value": Array [
            10674,
            10728,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1xml/schema/type",
        Object {
          "file": 0,
          "key": Array [
            10694,
            10700,
          ],
          "node": Array [
            10694,
            10710,
          ],
          "value": Array [
            10702,
            10710,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json",
        Object {
          "file": 0,
          "key": Array [
            10760,
            10778,
          ],
          "node": Array [
            10760,
            10878,
          ],
          "value": Array [
            10780,
            10878,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json/schema",
        Object {
          "file": 0,
          "key": Array [
            10798,
            10806,
          ],
          "node": Array [
            10798,
            10862,
          ],
          "value": Array [
            10808,
            10862,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/200/content/application~1json/schema/type",
        Object {
          "file": 0,
          "key": Array [
            10828,
            10834,
          ],
          "node": Array [
            10828,
            10844,
          ],
          "value": Array [
            10836,
            10844,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400",
        Object {
          "file": 0,
          "key": Array [
            10916,
            10921,
          ],
          "node": Array [
            10916,
            11027,
          ],
          "value": Array [
            10923,
            11027,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400/description",
        Object {
          "file": 0,
          "key": Array [
            10937,
            10950,
          ],
          "node": Array [
            10937,
            10988,
          ],
          "value": Array [
            10952,
            10988,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses/400/content",
        Object {
          "file": 0,
          "key": Array [
            11002,
            11011,
          ],
          "node": Array [
            11002,
            11015,
          ],
          "value": Array [
            11013,
            11015,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout",
        Object {
          "file": 0,
          "key": Array [
            11057,
            11071,
          ],
          "node": Array [
            11057,
            11393,
          ],
          "value": Array [
            11073,
            11393,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get",
        Object {
          "file": 0,
          "key": Array [
            11081,
            11086,
          ],
          "node": Array [
            11081,
            11387,
          ],
          "value": Array [
            11088,
            11387,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags",
        Object {
          "file": 0,
          "key": Array [
            11098,
            11104,
          ],
          "node": Array [
            11098,
            11134,
          ],
          "value": Array [
            11106,
            11134,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags/0",
        Object {
          "file": 0,
          "node": Array [
            11118,
            11124,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/summary",
        Object {
          "file": 0,
          "key": Array [
            11144,
            11153,
          ],
          "node": Array [
            11144,
            11196,
          ],
          "value": Array [
            11155,
            11196,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/operationId",
        Object {
          "file": 0,
          "key": Array [
            11206,
            11219,
          ],
          "node": Array [
            11206,
            11233,
          ],
          "value": Array [
            11221,
            11233,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses",
        Object {
          "file": 0,
          "key": Array [
            11243,
            11254,
          ],
          "node": Array [
            11243,
            11379,
          ],
          "value": Array [
            11256,
            11379,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default",
        Object {
          "file": 0,
          "key": Array [
            11268,
            11277,
          ],
          "node": Array [
            11268,
            11369,
          ],
          "value": Array [
            11279,
            11369,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/description",
        Object {
          "file": 0,
          "key": Array [
            11293,
            11306,
          ],
          "node": Array [
            11293,
            11330,
          ],
          "value": Array [
            11308,
            11330,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/content",
        Object {
          "file": 0,
          "key": Array [
            11344,
            11353,
          ],
          "node": Array [
            11344,
            11357,
          ],
          "value": Array [
            11355,
            11357,
          ],
        },
      ],
      Array [
        "#/components",
        Object {
          "file": 0,
          "key": Array [
            14367,
            14379,
          ],
          "node": Array [
            14367,
            18578,
          ],
          "value": Array [
            14381,
            18578,
          ],
        },
      ],
      Array [
        "#/components/schemas",
        Object {
          "file": 0,
          "key": Array [
            14387,
            14396,
          ],
          "node": Array [
            14387,
            18098,
          ],
          "value": Array [
            14398,
            18098,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order",
        Object {
          "file": 0,
          "key": Array [
            14406,
            14413,
          ],
          "node": Array [
            14406,
            15240,
          ],
          "value": Array [
            14415,
            15240,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category",
        Object {
          "file": 0,
          "key": Array [
            15248,
            15258,
          ],
          "node": Array [
            15248,
            15539,
          ],
          "value": Array [
            15260,
            15539,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/type",
        Object {
          "file": 0,
          "key": Array [
            15270,
            15276,
          ],
          "node": Array [
            15270,
            15286,
          ],
          "value": Array [
            15278,
            15286,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties",
        Object {
          "file": 0,
          "key": Array [
            15296,
            15308,
          ],
          "node": Array [
            15296,
            15474,
          ],
          "value": Array [
            15310,
            15474,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id",
        Object {
          "file": 0,
          "key": Array [
            15322,
            15326,
          ],
          "node": Array [
            15322,
            15402,
          ],
          "value": Array [
            15328,
            15402,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            15342,
            15348,
          ],
          "node": Array [
            15342,
            15359,
          ],
          "value": Array [
            15350,
            15359,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            15373,
            15381,
          ],
          "node": Array [
            15373,
            15390,
          ],
          "value": Array [
            15383,
            15390,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name",
        Object {
          "file": 0,
          "key": Array [
            15414,
            15420,
          ],
          "node": Array [
            15414,
            15464,
          ],
          "value": Array [
            15422,
            15464,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            15436,
            15442,
          ],
          "node": Array [
            15436,
            15452,
          ],
          "value": Array [
            15444,
            15452,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml",
        Object {
          "file": 0,
          "key": Array [
            15484,
            15489,
          ],
          "node": Array [
            15484,
            15531,
          ],
          "value": Array [
            15491,
            15531,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml/name",
        Object {
          "file": 0,
          "key": Array [
            15503,
            15509,
          ],
          "node": Array [
            15503,
            15521,
          ],
          "value": Array [
            15511,
            15521,
          ],
        },
      ],
      Array [
        "#/components/schemas/User",
        Object {
          "file": 0,
          "key": Array [
            15547,
            15553,
          ],
          "node": Array [
            15547,
            16301,
          ],
          "value": Array [
            15555,
            16301,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag",
        Object {
          "file": 0,
          "key": Array [
            16309,
            16314,
          ],
          "node": Array [
            16309,
            16590,
          ],
          "value": Array [
            16316,
            16590,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/type",
        Object {
          "file": 0,
          "key": Array [
            16326,
            16332,
          ],
          "node": Array [
            16326,
            16342,
          ],
          "value": Array [
            16334,
            16342,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties",
        Object {
          "file": 0,
          "key": Array [
            16352,
            16364,
          ],
          "node": Array [
            16352,
            16530,
          ],
          "value": Array [
            16366,
            16530,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id",
        Object {
          "file": 0,
          "key": Array [
            16378,
            16382,
          ],
          "node": Array [
            16378,
            16458,
          ],
          "value": Array [
            16384,
            16458,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            16398,
            16404,
          ],
          "node": Array [
            16398,
            16415,
          ],
          "value": Array [
            16406,
            16415,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            16429,
            16437,
          ],
          "node": Array [
            16429,
            16446,
          ],
          "value": Array [
            16439,
            16446,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name",
        Object {
          "file": 0,
          "key": Array [
            16470,
            16476,
          ],
          "node": Array [
            16470,
            16520,
          ],
          "value": Array [
            16478,
            16520,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            16492,
            16498,
          ],
          "node": Array [
            16492,
            16508,
          ],
          "value": Array [
            16500,
            16508,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml",
        Object {
          "file": 0,
          "key": Array [
            16540,
            16545,
          ],
          "node": Array [
            16540,
            16582,
          ],
          "value": Array [
            16547,
            16582,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml/name",
        Object {
          "file": 0,
          "key": Array [
            16559,
            16565,
          ],
          "node": Array [
            16559,
            16572,
          ],
          "value": Array [
            16567,
            16572,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet",
        Object {
          "file": 0,
          "key": Array [
            16598,
            16603,
          ],
          "node": Array [
            16598,
            17780,
          ],
          "value": Array [
            16605,
            17780,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required",
        Object {
          "file": 0,
          "key": Array [
            16615,
            16625,
          ],
          "node": Array [
            16615,
            16678,
          ],
          "value": Array [
            16627,
            16678,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/0",
        Object {
          "file": 0,
          "node": Array [
            16639,
            16645,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/1",
        Object {
          "file": 0,
          "node": Array [
            16657,
            16668,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/type",
        Object {
          "file": 0,
          "key": Array [
            16688,
            16694,
          ],
          "node": Array [
            16688,
            16704,
          ],
          "value": Array [
            16696,
            16704,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties",
        Object {
          "file": 0,
          "key": Array [
            16714,
            16726,
          ],
          "node": Array [
            16714,
            17720,
          ],
          "value": Array [
            16728,
            17720,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id",
        Object {
          "file": 0,
          "key": Array [
            16740,
            16744,
          ],
          "node": Array [
            16740,
            16820,
          ],
          "value": Array [
            16746,
            16820,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/type",
        Object {
          "file": 0,
          "key": Array [
            16760,
            16766,
          ],
          "node": Array [
            16760,
            16777,
          ],
          "value": Array [
            16768,
            16777,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/format",
        Object {
          "file": 0,
          "key": Array [
            16791,
            16799,
          ],
          "node": Array [
            16791,
            16808,
          ],
          "value": Array [
            16801,
            16808,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/category",
        Object {
          "file": 0,
          "key": Array [
            15248,
            15258,
          ],
          "node": Array [
            15248,
            15539,
          ],
          "value": Array [
            15260,
            15539,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name",
        Object {
          "file": 0,
          "key": Array [
            16921,
            16927,
          ],
          "node": Array [
            16921,
            17004,
          ],
          "value": Array [
            16929,
            17004,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/type",
        Object {
          "file": 0,
          "key": Array [
            16943,
            16949,
          ],
          "node": Array [
            16943,
            16959,
          ],
          "value": Array [
            16951,
            16959,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/example",
        Object {
          "file": 0,
          "key": Array [
            16973,
            16982,
          ],
          "node": Array [
            16973,
            16992,
          ],
          "value": Array [
            16984,
            16992,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls",
        Object {
          "file": 0,
          "key": Array [
            17016,
            17027,
          ],
          "node": Array [
            17016,
            17239,
          ],
          "value": Array [
            17029,
            17239,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/type",
        Object {
          "file": 0,
          "key": Array [
            17043,
            17049,
          ],
          "node": Array [
            17043,
            17058,
          ],
          "value": Array [
            17051,
            17058,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml",
        Object {
          "file": 0,
          "key": Array [
            17072,
            17077,
          ],
          "node": Array [
            17072,
            17158,
          ],
          "value": Array [
            17079,
            17158,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/name",
        Object {
          "file": 0,
          "key": Array [
            17095,
            17101,
          ],
          "node": Array [
            17095,
            17113,
          ],
          "value": Array [
            17103,
            17113,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/wrapped",
        Object {
          "file": 0,
          "key": Array [
            17129,
            17138,
          ],
          "node": Array [
            17129,
            17144,
          ],
          "value": Array [
            17140,
            17144,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items",
        Object {
          "file": 0,
          "key": Array [
            17172,
            17179,
          ],
          "node": Array [
            17172,
            17227,
          ],
          "value": Array [
            17181,
            17227,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items/type",
        Object {
          "file": 0,
          "key": Array [
            17197,
            17203,
          ],
          "node": Array [
            17197,
            17213,
          ],
          "value": Array [
            17205,
            17213,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags",
        Object {
          "file": 0,
          "key": Array [
            17251,
            17257,
          ],
          "node": Array [
            17251,
            17482,
          ],
          "value": Array [
            17259,
            17482,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/type",
        Object {
          "file": 0,
          "key": Array [
            17273,
            17279,
          ],
          "node": Array [
            17273,
            17288,
          ],
          "value": Array [
            17281,
            17288,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml",
        Object {
          "file": 0,
          "key": Array [
            17302,
            17307,
          ],
          "node": Array [
            17302,
            17383,
          ],
          "value": Array [
            17309,
            17383,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/name",
        Object {
          "file": 0,
          "key": Array [
            17325,
            17331,
          ],
          "node": Array [
            17325,
            17338,
          ],
          "value": Array [
            17333,
            17338,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/wrapped",
        Object {
          "file": 0,
          "key": Array [
            17354,
            17363,
          ],
          "node": Array [
            17354,
            17369,
          ],
          "value": Array [
            17365,
            17369,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/items",
        Object {
          "file": 0,
          "key": Array [
            16309,
            16314,
          ],
          "node": Array [
            16309,
            16590,
          ],
          "value": Array [
            16316,
            16590,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status",
        Object {
          "file": 0,
          "key": Array [
            17494,
            17502,
          ],
          "node": Array [
            17494,
            17710,
          ],
          "value": Array [
            17504,
            17710,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/type",
        Object {
          "file": 0,
          "key": Array [
            17518,
            17524,
          ],
          "node": Array [
            17518,
            17534,
          ],
          "value": Array [
            17526,
            17534,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/description",
        Object {
          "file": 0,
          "key": Array [
            17548,
            17561,
          ],
          "node": Array [
            17548,
            17588,
          ],
          "value": Array [
            17563,
            17588,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum",
        Object {
          "file": 0,
          "key": Array [
            17602,
            17608,
          ],
          "node": Array [
            17602,
            17698,
          ],
          "value": Array [
            17610,
            17698,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/0",
        Object {
          "file": 0,
          "node": Array [
            17626,
            17637,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/1",
        Object {
          "file": 0,
          "node": Array [
            17653,
            17662,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/2",
        Object {
          "file": 0,
          "node": Array [
            17678,
            17684,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml",
        Object {
          "file": 0,
          "key": Array [
            17730,
            17735,
          ],
          "node": Array [
            17730,
            17772,
          ],
          "value": Array [
            17737,
            17772,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml/name",
        Object {
          "file": 0,
          "key": Array [
            17749,
            17755,
          ],
          "node": Array [
            17749,
            17762,
          ],
          "value": Array [
            17757,
            17762,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse",
        Object {
          "file": 0,
          "key": Array [
            17788,
            17801,
          ],
          "node": Array [
            17788,
            18092,
          ],
          "value": Array [
            17803,
            18092,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes",
        Object {
          "file": 0,
          "key": Array [
            18104,
            18121,
          ],
          "node": Array [
            18104,
            18574,
          ],
          "value": Array [
            18123,
            18574,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth",
        Object {
          "file": 0,
          "key": Array [
            18131,
            18146,
          ],
          "node": Array [
            18131,
            18464,
          ],
          "value": Array [
            18148,
            18464,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/type",
        Object {
          "file": 0,
          "key": Array [
            18158,
            18164,
          ],
          "node": Array [
            18158,
            18174,
          ],
          "value": Array [
            18166,
            18174,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows",
        Object {
          "file": 0,
          "key": Array [
            18184,
            18191,
          ],
          "node": Array [
            18184,
            18456,
          ],
          "value": Array [
            18193,
            18456,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit",
        Object {
          "file": 0,
          "key": Array [
            18205,
            18215,
          ],
          "node": Array [
            18205,
            18446,
          ],
          "value": Array [
            18217,
            18446,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/authorizationUrl",
        Object {
          "file": 0,
          "key": Array [
            18231,
            18249,
          ],
          "node": Array [
            18231,
            18292,
          ],
          "value": Array [
            18251,
            18292,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/scopes",
        Object {
          "file": 0,
          "key": Array [
            18306,
            18314,
          ],
          "node": Array [
            18306,
            18434,
          ],
          "value": Array [
            18316,
            18434,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key",
        Object {
          "file": 0,
          "key": Array [
            18472,
            18481,
          ],
          "node": Array [
            18472,
            18568,
          ],
          "value": Array [
            18483,
            18568,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/type",
        Object {
          "file": 0,
          "key": Array [
            18493,
            18499,
          ],
          "node": Array [
            18493,
            18509,
          ],
          "value": Array [
            18501,
            18509,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/name",
        Object {
          "file": 0,
          "key": Array [
            18519,
            18525,
          ],
          "node": Array [
            18519,
            18536,
          ],
          "value": Array [
            18527,
            18536,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/in",
        Object {
          "file": 0,
          "key": Array [
            18546,
            18550,
          ],
          "node": Array [
            18546,
            18560,
          ],
          "value": Array [
            18552,
            18560,
          ],
        },
      ],
    ],
  },
  "success": true,
}
`

exports[`src/loaders/file-on-branch.ts TAP > must match snapshot 3`] = `
Object {
  "flattened": Object {
    "example": Object {
      "token": "11111111",
      "user": Object {
        "$ref": "definitions.yaml#/User/example",
      },
    },
    "properties": Object {
      "token": Object {
        "type": "string",
      },
      "user": Object {
        "$ref": "definitions.yaml#/User",
      },
    },
    "required": Array [
      "user",
      "token",
    ],
    "type": "object",
  },
  "sourcemap": Object {
    "files": Array [
      Object {
        "index": 0,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/external-multiple.yaml",
      },
      Object {
        "index": 1,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/definitions.yaml",
      },
    ],
    "map": Array [
      Array [
        "#",
        Object {
          "file": 0,
          "node": Array [
            0,
            198,
          ],
        },
      ],
      Array [
        "#/type",
        Object {
          "file": 0,
          "key": Array [
            0,
            4,
          ],
          "node": Array [
            0,
            12,
          ],
          "value": Array [
            6,
            12,
          ],
        },
      ],
      Array [
        "#/required",
        Object {
          "file": 0,
          "key": Array [
            13,
            21,
          ],
          "node": Array [
            13,
            36,
          ],
          "value": Array [
            23,
            36,
          ],
        },
      ],
      Array [
        "#/required/0",
        Object {
          "file": 0,
          "node": Array [
            24,
            28,
          ],
        },
      ],
      Array [
        "#/required/1",
        Object {
          "file": 0,
          "node": Array [
            30,
            35,
          ],
        },
      ],
      Array [
        "#/properties",
        Object {
          "file": 0,
          "key": Array [
            37,
            47,
          ],
          "node": Array [
            37,
            117,
          ],
          "value": Array [
            51,
            117,
          ],
        },
      ],
      Array [
        "#/properties/token",
        Object {
          "file": 0,
          "key": Array [
            51,
            56,
          ],
          "node": Array [
            51,
            74,
          ],
          "value": Array [
            62,
            74,
          ],
        },
      ],
      Array [
        "#/properties/token/type",
        Object {
          "file": 0,
          "key": Array [
            62,
            66,
          ],
          "node": Array [
            62,
            74,
          ],
          "value": Array [
            68,
            74,
          ],
        },
      ],
      Array [
        "#/properties/user",
        Object {
          "file": 0,
          "key": Array [
            77,
            81,
          ],
          "node": Array [
            77,
            117,
          ],
          "value": Array [
            87,
            117,
          ],
        },
      ],
      Array [
        "#/example",
        Object {
          "file": 0,
          "key": Array [
            118,
            125,
          ],
          "node": Array [
            118,
            197,
          ],
          "value": Array [
            129,
            197,
          ],
        },
      ],
      Array [
        "#/example/token",
        Object {
          "file": 0,
          "key": Array [
            129,
            134,
          ],
          "node": Array [
            129,
            146,
          ],
          "value": Array [
            136,
            146,
          ],
        },
      ],
      Array [
        "#/example/user",
        Object {
          "file": 0,
          "key": Array [
            149,
            153,
          ],
          "node": Array [
            149,
            197,
          ],
          "value": Array [
            159,
            197,
          ],
        },
      ],
    ],
  },
  "success": true,
}
`

exports[`src/loaders/file-on-branch.ts TAP > must match snapshot 4`] = `
Object {
  "flattened": Object {
    "example": Object {
      "token": "11111111",
      "user": Object {
        "$ref": "definitions.yaml#/User/example",
      },
    },
    "properties": Object {
      "token": Object {
        "type": "string",
      },
      "user": Object {
        "$ref": "definitions.yaml#/User",
      },
    },
    "required": Array [
      "user",
      "token",
    ],
    "type": "object",
  },
  "sourcemap": Object {
    "files": Array [
      Object {
        "index": 0,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/external-multiple.yaml",
      },
      Object {
        "index": 1,
        "path": "/Users/aidancunniffe/Developer/openapi-optic/poc-governance-tools/inputs/git-repo/definitions.yaml",
      },
    ],
    "map": Array [
      Array [
        "#",
        Object {
          "file": 0,
          "node": Array [
            0,
            198,
          ],
        },
      ],
      Array [
        "#/type",
        Object {
          "file": 0,
          "key": Array [
            0,
            4,
          ],
          "node": Array [
            0,
            12,
          ],
          "value": Array [
            6,
            12,
          ],
        },
      ],
      Array [
        "#/required",
        Object {
          "file": 0,
          "key": Array [
            13,
            21,
          ],
          "node": Array [
            13,
            36,
          ],
          "value": Array [
            23,
            36,
          ],
        },
      ],
      Array [
        "#/required/0",
        Object {
          "file": 0,
          "node": Array [
            24,
            28,
          ],
        },
      ],
      Array [
        "#/required/1",
        Object {
          "file": 0,
          "node": Array [
            30,
            35,
          ],
        },
      ],
      Array [
        "#/properties",
        Object {
          "file": 0,
          "key": Array [
            37,
            47,
          ],
          "node": Array [
            37,
            117,
          ],
          "value": Array [
            51,
            117,
          ],
        },
      ],
      Array [
        "#/properties/token",
        Object {
          "file": 0,
          "key": Array [
            51,
            56,
          ],
          "node": Array [
            51,
            74,
          ],
          "value": Array [
            62,
            74,
          ],
        },
      ],
      Array [
        "#/properties/token/type",
        Object {
          "file": 0,
          "key": Array [
            62,
            66,
          ],
          "node": Array [
            62,
            74,
          ],
          "value": Array [
            68,
            74,
          ],
        },
      ],
      Array [
        "#/properties/user",
        Object {
          "file": 0,
          "key": Array [
            77,
            81,
          ],
          "node": Array [
            77,
            117,
          ],
          "value": Array [
            87,
            117,
          ],
        },
      ],
      Array [
        "#/example",
        Object {
          "file": 0,
          "key": Array [
            118,
            125,
          ],
          "node": Array [
            118,
            197,
          ],
          "value": Array [
            129,
            197,
          ],
        },
      ],
      Array [
        "#/example/token",
        Object {
          "file": 0,
          "key": Array [
            129,
            134,
          ],
          "node": Array [
            129,
            146,
          ],
          "value": Array [
            136,
            146,
          ],
        },
      ],
      Array [
        "#/example/user",
        Object {
          "file": 0,
          "key": Array [
            149,
            153,
          ],
          "node": Array [
            149,
            197,
          ],
          "value": Array [
            159,
            197,
          ],
        },
      ],
    ],
  },
  "success": true,
}
`
