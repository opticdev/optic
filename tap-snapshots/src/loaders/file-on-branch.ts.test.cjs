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
          "f": 0,
          "n": Array [
            0,
            11440,
          ],
        },
      ],
      Array [
        "#/openapi",
        Object {
          "f": 0,
          "k": Array [
            4,
            13,
          ],
          "n": Array [
            4,
            22,
          ],
          "v": Array [
            15,
            22,
          ],
        },
      ],
      Array [
        "#/info",
        Object {
          "f": 0,
          "k": Array [
            26,
            32,
          ],
          "n": Array [
            26,
            625,
          ],
          "v": Array [
            34,
            625,
          ],
        },
      ],
      Array [
        "#/info/title",
        Object {
          "f": 0,
          "k": Array [
            40,
            47,
          ],
          "n": Array [
            40,
            67,
          ],
          "v": Array [
            49,
            67,
          ],
        },
      ],
      Array [
        "#/info/description",
        Object {
          "f": 0,
          "k": Array [
            73,
            86,
          ],
          "n": Array [
            73,
            372,
          ],
          "v": Array [
            88,
            372,
          ],
        },
      ],
      Array [
        "#/info/termsOfService",
        Object {
          "f": 0,
          "k": Array [
            378,
            394,
          ],
          "n": Array [
            378,
            422,
          ],
          "v": Array [
            396,
            422,
          ],
        },
      ],
      Array [
        "#/info/contact",
        Object {
          "f": 0,
          "k": Array [
            428,
            437,
          ],
          "n": Array [
            428,
            482,
          ],
          "v": Array [
            439,
            482,
          ],
        },
      ],
      Array [
        "#/info/contact/email",
        Object {
          "f": 0,
          "k": Array [
            447,
            454,
          ],
          "n": Array [
            447,
            476,
          ],
          "v": Array [
            456,
            476,
          ],
        },
      ],
      Array [
        "#/info/license",
        Object {
          "f": 0,
          "k": Array [
            488,
            497,
          ],
          "n": Array [
            488,
            597,
          ],
          "v": Array [
            499,
            597,
          ],
        },
      ],
      Array [
        "#/info/license/name",
        Object {
          "f": 0,
          "k": Array [
            507,
            513,
          ],
          "n": Array [
            507,
            527,
          ],
          "v": Array [
            515,
            527,
          ],
        },
      ],
      Array [
        "#/info/license/url",
        Object {
          "f": 0,
          "k": Array [
            535,
            540,
          ],
          "n": Array [
            535,
            591,
          ],
          "v": Array [
            542,
            591,
          ],
        },
      ],
      Array [
        "#/info/version",
        Object {
          "f": 0,
          "k": Array [
            603,
            612,
          ],
          "n": Array [
            603,
            621,
          ],
          "v": Array [
            614,
            621,
          ],
        },
      ],
      Array [
        "#/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            629,
            643,
          ],
          "n": Array [
            629,
            731,
          ],
          "v": Array [
            645,
            731,
          ],
        },
      ],
      Array [
        "#/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            651,
            664,
          ],
          "n": Array [
            651,
            695,
          ],
          "v": Array [
            666,
            695,
          ],
        },
      ],
      Array [
        "#/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            701,
            706,
          ],
          "n": Array [
            701,
            727,
          ],
          "v": Array [
            708,
            727,
          ],
        },
      ],
      Array [
        "#/servers",
        Object {
          "f": 0,
          "k": Array [
            735,
            744,
          ],
          "n": Array [
            735,
            867,
          ],
          "v": Array [
            746,
            867,
          ],
        },
      ],
      Array [
        "#/servers/0",
        Object {
          "f": 0,
          "n": Array [
            752,
            805,
          ],
        },
      ],
      Array [
        "#/servers/0/url",
        Object {
          "f": 0,
          "k": Array [
            760,
            765,
          ],
          "n": Array [
            760,
            799,
          ],
          "v": Array [
            767,
            799,
          ],
        },
      ],
      Array [
        "#/servers/1",
        Object {
          "f": 0,
          "n": Array [
            811,
            863,
          ],
        },
      ],
      Array [
        "#/servers/1/url",
        Object {
          "f": 0,
          "k": Array [
            819,
            824,
          ],
          "n": Array [
            819,
            857,
          ],
          "v": Array [
            826,
            857,
          ],
        },
      ],
      Array [
        "#/tags",
        Object {
          "f": 0,
          "k": Array [
            871,
            877,
          ],
          "n": Array [
            871,
            1364,
          ],
          "v": Array [
            879,
            1364,
          ],
        },
      ],
      Array [
        "#/tags/0",
        Object {
          "f": 0,
          "n": Array [
            885,
            1071,
          ],
        },
      ],
      Array [
        "#/tags/0/name",
        Object {
          "f": 0,
          "k": Array [
            893,
            899,
          ],
          "n": Array [
            893,
            906,
          ],
          "v": Array [
            901,
            906,
          ],
        },
      ],
      Array [
        "#/tags/0/description",
        Object {
          "f": 0,
          "k": Array [
            914,
            927,
          ],
          "n": Array [
            914,
            957,
          ],
          "v": Array [
            929,
            957,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            965,
            979,
          ],
          "n": Array [
            965,
            1065,
          ],
          "v": Array [
            981,
            1065,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            991,
            1004,
          ],
          "n": Array [
            991,
            1021,
          ],
          "v": Array [
            1006,
            1021,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            1031,
            1036,
          ],
          "n": Array [
            1031,
            1057,
          ],
          "v": Array [
            1038,
            1057,
          ],
        },
      ],
      Array [
        "#/tags/1",
        Object {
          "f": 0,
          "n": Array [
            1077,
            1156,
          ],
        },
      ],
      Array [
        "#/tags/1/name",
        Object {
          "f": 0,
          "k": Array [
            1085,
            1091,
          ],
          "n": Array [
            1085,
            1100,
          ],
          "v": Array [
            1093,
            1100,
          ],
        },
      ],
      Array [
        "#/tags/1/description",
        Object {
          "f": 0,
          "k": Array [
            1108,
            1121,
          ],
          "n": Array [
            1108,
            1150,
          ],
          "v": Array [
            1123,
            1150,
          ],
        },
      ],
      Array [
        "#/tags/2",
        Object {
          "f": 0,
          "n": Array [
            1162,
            1360,
          ],
        },
      ],
      Array [
        "#/tags/2/name",
        Object {
          "f": 0,
          "k": Array [
            1170,
            1176,
          ],
          "n": Array [
            1170,
            1184,
          ],
          "v": Array [
            1178,
            1184,
          ],
        },
      ],
      Array [
        "#/tags/2/description",
        Object {
          "f": 0,
          "k": Array [
            1192,
            1205,
          ],
          "n": Array [
            1192,
            1230,
          ],
          "v": Array [
            1207,
            1230,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            1238,
            1252,
          ],
          "n": Array [
            1238,
            1354,
          ],
          "v": Array [
            1254,
            1354,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            1264,
            1277,
          ],
          "n": Array [
            1264,
            1310,
          ],
          "v": Array [
            1279,
            1310,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            1320,
            1325,
          ],
          "n": Array [
            1320,
            1346,
          ],
          "v": Array [
            1327,
            1346,
          ],
        },
      ],
      Array [
        "#/paths",
        Object {
          "f": 0,
          "k": Array [
            1368,
            1375,
          ],
          "n": Array [
            1368,
            7222,
          ],
          "v": Array [
            1377,
            7222,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList",
        Object {
          "f": 0,
          "k": Array [
            1383,
            1405,
          ],
          "n": Array [
            1383,
            2150,
          ],
          "v": Array [
            1407,
            2150,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post",
        Object {
          "f": 0,
          "k": Array [
            1415,
            1421,
          ],
          "n": Array [
            1415,
            2144,
          ],
          "v": Array [
            1423,
            2144,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags",
        Object {
          "f": 0,
          "k": Array [
            1433,
            1439,
          ],
          "n": Array [
            1433,
            1469,
          ],
          "v": Array [
            1441,
            1469,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags/0",
        Object {
          "f": 0,
          "n": Array [
            1453,
            1459,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/summary",
        Object {
          "f": 0,
          "k": Array [
            1479,
            1488,
          ],
          "n": Array [
            1479,
            1536,
          ],
          "v": Array [
            1490,
            1536,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/operationId",
        Object {
          "f": 0,
          "k": Array [
            1546,
            1559,
          ],
          "n": Array [
            1546,
            1587,
          ],
          "v": Array [
            1561,
            1587,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody",
        Object {
          "f": 0,
          "k": Array [
            1597,
            1610,
          ],
          "n": Array [
            1597,
            1943,
          ],
          "v": Array [
            1612,
            1943,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/description",
        Object {
          "f": 0,
          "k": Array [
            1624,
            1637,
          ],
          "n": Array [
            1624,
            1660,
          ],
          "v": Array [
            1639,
            1660,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content",
        Object {
          "f": 0,
          "k": Array [
            1672,
            1681,
          ],
          "n": Array [
            1672,
            1905,
          ],
          "v": Array [
            1683,
            1905,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*",
        Object {
          "f": 0,
          "k": Array [
            1697,
            1702,
          ],
          "n": Array [
            1697,
            1893,
          ],
          "v": Array [
            1704,
            1893,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema",
        Object {
          "f": 0,
          "k": Array [
            1720,
            1728,
          ],
          "n": Array [
            1720,
            1879,
          ],
          "v": Array [
            1730,
            1879,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/type",
        Object {
          "f": 0,
          "k": Array [
            1748,
            1754,
          ],
          "n": Array [
            1748,
            1763,
          ],
          "v": Array [
            1756,
            1763,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items",
        Object {
          "f": 0,
          "k": Array [
            8406,
            8412,
          ],
          "n": Array [
            8406,
            9160,
          ],
          "v": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/type",
        Object {
          "f": 0,
          "k": Array [
            8424,
            8430,
          ],
          "n": Array [
            8424,
            8440,
          ],
          "v": Array [
            8432,
            8440,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties",
        Object {
          "f": 0,
          "k": Array [
            8450,
            8462,
          ],
          "n": Array [
            8450,
            9099,
          ],
          "v": Array [
            8464,
            9099,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id",
        Object {
          "f": 0,
          "k": Array [
            8476,
            8480,
          ],
          "n": Array [
            8476,
            8556,
          ],
          "v": Array [
            8482,
            8556,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            8496,
            8502,
          ],
          "n": Array [
            8496,
            8513,
          ],
          "v": Array [
            8504,
            8513,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            8527,
            8535,
          ],
          "n": Array [
            8527,
            8544,
          ],
          "v": Array [
            8537,
            8544,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username",
        Object {
          "f": 0,
          "k": Array [
            8568,
            8578,
          ],
          "n": Array [
            8568,
            8622,
          ],
          "v": Array [
            8580,
            8622,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username/type",
        Object {
          "f": 0,
          "k": Array [
            8594,
            8600,
          ],
          "n": Array [
            8594,
            8610,
          ],
          "v": Array [
            8602,
            8610,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName",
        Object {
          "f": 0,
          "k": Array [
            8634,
            8645,
          ],
          "n": Array [
            8634,
            8689,
          ],
          "v": Array [
            8647,
            8689,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName/type",
        Object {
          "f": 0,
          "k": Array [
            8661,
            8667,
          ],
          "n": Array [
            8661,
            8677,
          ],
          "v": Array [
            8669,
            8677,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName",
        Object {
          "f": 0,
          "k": Array [
            8701,
            8711,
          ],
          "n": Array [
            8701,
            8755,
          ],
          "v": Array [
            8713,
            8755,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName/type",
        Object {
          "f": 0,
          "k": Array [
            8727,
            8733,
          ],
          "n": Array [
            8727,
            8743,
          ],
          "v": Array [
            8735,
            8743,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email",
        Object {
          "f": 0,
          "k": Array [
            8767,
            8774,
          ],
          "n": Array [
            8767,
            8818,
          ],
          "v": Array [
            8776,
            8818,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email/type",
        Object {
          "f": 0,
          "k": Array [
            8790,
            8796,
          ],
          "n": Array [
            8790,
            8806,
          ],
          "v": Array [
            8798,
            8806,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password",
        Object {
          "f": 0,
          "k": Array [
            8830,
            8840,
          ],
          "n": Array [
            8830,
            8884,
          ],
          "v": Array [
            8842,
            8884,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password/type",
        Object {
          "f": 0,
          "k": Array [
            8856,
            8862,
          ],
          "n": Array [
            8856,
            8872,
          ],
          "v": Array [
            8864,
            8872,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone",
        Object {
          "f": 0,
          "k": Array [
            8896,
            8903,
          ],
          "n": Array [
            8896,
            8947,
          ],
          "v": Array [
            8905,
            8947,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone/type",
        Object {
          "f": 0,
          "k": Array [
            8919,
            8925,
          ],
          "n": Array [
            8919,
            8935,
          ],
          "v": Array [
            8927,
            8935,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus",
        Object {
          "f": 0,
          "k": Array [
            8959,
            8971,
          ],
          "n": Array [
            8959,
            9089,
          ],
          "v": Array [
            8973,
            9089,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/type",
        Object {
          "f": 0,
          "k": Array [
            8987,
            8993,
          ],
          "n": Array [
            8987,
            9004,
          ],
          "v": Array [
            8995,
            9004,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/description",
        Object {
          "f": 0,
          "k": Array [
            9018,
            9031,
          ],
          "n": Array [
            9018,
            9046,
          ],
          "v": Array [
            9033,
            9046,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus/format",
        Object {
          "f": 0,
          "k": Array [
            9060,
            9068,
          ],
          "n": Array [
            9060,
            9077,
          ],
          "v": Array [
            9070,
            9077,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/xml",
        Object {
          "f": 0,
          "k": Array [
            9109,
            9114,
          ],
          "n": Array [
            9109,
            9152,
          ],
          "v": Array [
            9116,
            9152,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9128,
            9134,
          ],
          "n": Array [
            9128,
            9142,
          ],
          "v": Array [
            9136,
            9142,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/required",
        Object {
          "f": 0,
          "k": Array [
            1917,
            1927,
          ],
          "n": Array [
            1917,
            1933,
          ],
          "v": Array [
            1929,
            1933,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses",
        Object {
          "f": 0,
          "k": Array [
            1953,
            1964,
          ],
          "n": Array [
            1953,
            2089,
          ],
          "v": Array [
            1966,
            2089,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default",
        Object {
          "f": 0,
          "k": Array [
            1978,
            1987,
          ],
          "n": Array [
            1978,
            2079,
          ],
          "v": Array [
            1989,
            2079,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/description",
        Object {
          "f": 0,
          "k": Array [
            2003,
            2016,
          ],
          "n": Array [
            2003,
            2040,
          ],
          "v": Array [
            2018,
            2040,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/content",
        Object {
          "f": 0,
          "k": Array [
            2054,
            2063,
          ],
          "n": Array [
            2054,
            2067,
          ],
          "v": Array [
            2065,
            2067,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/x-codegen-request-body-name",
        Object {
          "f": 0,
          "k": Array [
            2099,
            2128,
          ],
          "n": Array [
            2099,
            2136,
          ],
          "v": Array [
            2130,
            2136,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login",
        Object {
          "f": 0,
          "k": Array [
            2156,
            2169,
          ],
          "n": Array [
            2156,
            3910,
          ],
          "v": Array [
            2171,
            3910,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get",
        Object {
          "f": 0,
          "k": Array [
            2179,
            2184,
          ],
          "n": Array [
            2179,
            3904,
          ],
          "v": Array [
            2186,
            3904,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags",
        Object {
          "f": 0,
          "k": Array [
            2196,
            2202,
          ],
          "n": Array [
            2196,
            2232,
          ],
          "v": Array [
            2204,
            2232,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags/0",
        Object {
          "f": 0,
          "n": Array [
            2216,
            2222,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/summary",
        Object {
          "f": 0,
          "k": Array [
            2242,
            2251,
          ],
          "n": Array [
            2242,
            2280,
          ],
          "v": Array [
            2253,
            2280,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/operationId",
        Object {
          "f": 0,
          "k": Array [
            2290,
            2303,
          ],
          "n": Array [
            2290,
            2316,
          ],
          "v": Array [
            2305,
            2316,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters",
        Object {
          "f": 0,
          "k": Array [
            2326,
            2338,
          ],
          "n": Array [
            2326,
            2837,
          ],
          "v": Array [
            2340,
            2837,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0",
        Object {
          "f": 0,
          "n": Array [
            2352,
            2577,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/name",
        Object {
          "f": 0,
          "k": Array [
            2366,
            2372,
          ],
          "n": Array [
            2366,
            2384,
          ],
          "v": Array [
            2374,
            2384,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/in",
        Object {
          "f": 0,
          "k": Array [
            2398,
            2402,
          ],
          "n": Array [
            2398,
            2411,
          ],
          "v": Array [
            2404,
            2411,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/description",
        Object {
          "f": 0,
          "k": Array [
            2425,
            2438,
          ],
          "n": Array [
            2425,
            2465,
          ],
          "v": Array [
            2440,
            2465,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/required",
        Object {
          "f": 0,
          "k": Array [
            2479,
            2489,
          ],
          "n": Array [
            2479,
            2495,
          ],
          "v": Array [
            2491,
            2495,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema",
        Object {
          "f": 0,
          "k": Array [
            2509,
            2517,
          ],
          "n": Array [
            2509,
            2565,
          ],
          "v": Array [
            2519,
            2565,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema/type",
        Object {
          "f": 0,
          "k": Array [
            2535,
            2541,
          ],
          "n": Array [
            2535,
            2551,
          ],
          "v": Array [
            2543,
            2551,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1",
        Object {
          "f": 0,
          "n": Array [
            2589,
            2827,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/name",
        Object {
          "f": 0,
          "k": Array [
            2603,
            2609,
          ],
          "n": Array [
            2603,
            2621,
          ],
          "v": Array [
            2611,
            2621,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/in",
        Object {
          "f": 0,
          "k": Array [
            2635,
            2639,
          ],
          "n": Array [
            2635,
            2648,
          ],
          "v": Array [
            2641,
            2648,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/description",
        Object {
          "f": 0,
          "k": Array [
            2662,
            2675,
          ],
          "n": Array [
            2662,
            2715,
          ],
          "v": Array [
            2677,
            2715,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/required",
        Object {
          "f": 0,
          "k": Array [
            2729,
            2739,
          ],
          "n": Array [
            2729,
            2745,
          ],
          "v": Array [
            2741,
            2745,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema",
        Object {
          "f": 0,
          "k": Array [
            2759,
            2767,
          ],
          "n": Array [
            2759,
            2815,
          ],
          "v": Array [
            2769,
            2815,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema/type",
        Object {
          "f": 0,
          "k": Array [
            2785,
            2791,
          ],
          "n": Array [
            2785,
            2801,
          ],
          "v": Array [
            2793,
            2801,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses",
        Object {
          "f": 0,
          "k": Array [
            2847,
            2858,
          ],
          "n": Array [
            2847,
            3896,
          ],
          "v": Array [
            2860,
            3896,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout",
        Object {
          "f": 0,
          "k": Array [
            3916,
            3930,
          ],
          "n": Array [
            3916,
            4252,
          ],
          "v": Array [
            3932,
            4252,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get",
        Object {
          "f": 0,
          "k": Array [
            3940,
            3945,
          ],
          "n": Array [
            3940,
            4246,
          ],
          "v": Array [
            3947,
            4246,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags",
        Object {
          "f": 0,
          "k": Array [
            3957,
            3963,
          ],
          "n": Array [
            3957,
            3993,
          ],
          "v": Array [
            3965,
            3993,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags/0",
        Object {
          "f": 0,
          "n": Array [
            3977,
            3983,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/summary",
        Object {
          "f": 0,
          "k": Array [
            4003,
            4012,
          ],
          "n": Array [
            4003,
            4055,
          ],
          "v": Array [
            4014,
            4055,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/operationId",
        Object {
          "f": 0,
          "k": Array [
            4065,
            4078,
          ],
          "n": Array [
            4065,
            4092,
          ],
          "v": Array [
            4080,
            4092,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses",
        Object {
          "f": 0,
          "k": Array [
            4102,
            4113,
          ],
          "n": Array [
            4102,
            4238,
          ],
          "v": Array [
            4115,
            4238,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default",
        Object {
          "f": 0,
          "k": Array [
            4127,
            4136,
          ],
          "n": Array [
            4127,
            4228,
          ],
          "v": Array [
            4138,
            4228,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/description",
        Object {
          "f": 0,
          "k": Array [
            4152,
            4165,
          ],
          "n": Array [
            4152,
            4189,
          ],
          "v": Array [
            4167,
            4189,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/content",
        Object {
          "f": 0,
          "k": Array [
            4203,
            4212,
          ],
          "n": Array [
            4203,
            4216,
          ],
          "v": Array [
            4214,
            4216,
          ],
        },
      ],
      Array [
        "#/components",
        Object {
          "f": 0,
          "k": Array [
            7226,
            7238,
          ],
          "n": Array [
            7226,
            11437,
          ],
          "v": Array [
            7240,
            11437,
          ],
        },
      ],
      Array [
        "#/components/schemas",
        Object {
          "f": 0,
          "k": Array [
            7246,
            7255,
          ],
          "n": Array [
            7246,
            10957,
          ],
          "v": Array [
            7257,
            10957,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order",
        Object {
          "f": 0,
          "k": Array [
            7265,
            7272,
          ],
          "n": Array [
            7265,
            8099,
          ],
          "v": Array [
            7274,
            8099,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/type",
        Object {
          "f": 0,
          "k": Array [
            7284,
            7290,
          ],
          "n": Array [
            7284,
            7300,
          ],
          "v": Array [
            7292,
            7300,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties",
        Object {
          "f": 0,
          "k": Array [
            7310,
            7322,
          ],
          "n": Array [
            7310,
            8037,
          ],
          "v": Array [
            7324,
            8037,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id",
        Object {
          "f": 0,
          "k": Array [
            7336,
            7340,
          ],
          "n": Array [
            7336,
            7416,
          ],
          "v": Array [
            7342,
            7416,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            7356,
            7362,
          ],
          "n": Array [
            7356,
            7373,
          ],
          "v": Array [
            7364,
            7373,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            7387,
            7395,
          ],
          "n": Array [
            7387,
            7404,
          ],
          "v": Array [
            7397,
            7404,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId",
        Object {
          "f": 0,
          "k": Array [
            7428,
            7435,
          ],
          "n": Array [
            7428,
            7511,
          ],
          "v": Array [
            7437,
            7511,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId/type",
        Object {
          "f": 0,
          "k": Array [
            7451,
            7457,
          ],
          "n": Array [
            7451,
            7468,
          ],
          "v": Array [
            7459,
            7468,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/petId/format",
        Object {
          "f": 0,
          "k": Array [
            7482,
            7490,
          ],
          "n": Array [
            7482,
            7499,
          ],
          "v": Array [
            7492,
            7499,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity",
        Object {
          "f": 0,
          "k": Array [
            7523,
            7533,
          ],
          "n": Array [
            7523,
            7609,
          ],
          "v": Array [
            7535,
            7609,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity/type",
        Object {
          "f": 0,
          "k": Array [
            7549,
            7555,
          ],
          "n": Array [
            7549,
            7566,
          ],
          "v": Array [
            7557,
            7566,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/quantity/format",
        Object {
          "f": 0,
          "k": Array [
            7580,
            7588,
          ],
          "n": Array [
            7580,
            7597,
          ],
          "v": Array [
            7590,
            7597,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate",
        Object {
          "f": 0,
          "k": Array [
            7621,
            7631,
          ],
          "n": Array [
            7621,
            7710,
          ],
          "v": Array [
            7633,
            7710,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate/type",
        Object {
          "f": 0,
          "k": Array [
            7647,
            7653,
          ],
          "n": Array [
            7647,
            7663,
          ],
          "v": Array [
            7655,
            7663,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/shipDate/format",
        Object {
          "f": 0,
          "k": Array [
            7677,
            7685,
          ],
          "n": Array [
            7677,
            7698,
          ],
          "v": Array [
            7687,
            7698,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status",
        Object {
          "f": 0,
          "k": Array [
            7722,
            7730,
          ],
          "n": Array [
            7722,
            7930,
          ],
          "v": Array [
            7732,
            7930,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/type",
        Object {
          "f": 0,
          "k": Array [
            7746,
            7752,
          ],
          "n": Array [
            7746,
            7762,
          ],
          "v": Array [
            7754,
            7762,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/description",
        Object {
          "f": 0,
          "k": Array [
            7776,
            7789,
          ],
          "n": Array [
            7776,
            7805,
          ],
          "v": Array [
            7791,
            7805,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum",
        Object {
          "f": 0,
          "k": Array [
            7819,
            7825,
          ],
          "n": Array [
            7819,
            7918,
          ],
          "v": Array [
            7827,
            7918,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/0",
        Object {
          "f": 0,
          "n": Array [
            7843,
            7851,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/1",
        Object {
          "f": 0,
          "n": Array [
            7867,
            7877,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/status/enum/2",
        Object {
          "f": 0,
          "n": Array [
            7893,
            7904,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete",
        Object {
          "f": 0,
          "k": Array [
            7942,
            7952,
          ],
          "n": Array [
            7942,
            8027,
          ],
          "v": Array [
            7954,
            8027,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete/type",
        Object {
          "f": 0,
          "k": Array [
            7968,
            7974,
          ],
          "n": Array [
            7968,
            7985,
          ],
          "v": Array [
            7976,
            7985,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/properties/complete/default",
        Object {
          "f": 0,
          "k": Array [
            7999,
            8008,
          ],
          "n": Array [
            7999,
            8015,
          ],
          "v": Array [
            8010,
            8015,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/xml",
        Object {
          "f": 0,
          "k": Array [
            8047,
            8052,
          ],
          "n": Array [
            8047,
            8091,
          ],
          "v": Array [
            8054,
            8091,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order/xml/name",
        Object {
          "f": 0,
          "k": Array [
            8066,
            8072,
          ],
          "n": Array [
            8066,
            8081,
          ],
          "v": Array [
            8074,
            8081,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category",
        Object {
          "f": 0,
          "k": Array [
            8107,
            8117,
          ],
          "n": Array [
            8107,
            8398,
          ],
          "v": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/type",
        Object {
          "f": 0,
          "k": Array [
            8129,
            8135,
          ],
          "n": Array [
            8129,
            8145,
          ],
          "v": Array [
            8137,
            8145,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties",
        Object {
          "f": 0,
          "k": Array [
            8155,
            8167,
          ],
          "n": Array [
            8155,
            8333,
          ],
          "v": Array [
            8169,
            8333,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id",
        Object {
          "f": 0,
          "k": Array [
            8181,
            8185,
          ],
          "n": Array [
            8181,
            8261,
          ],
          "v": Array [
            8187,
            8261,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            8201,
            8207,
          ],
          "n": Array [
            8201,
            8218,
          ],
          "v": Array [
            8209,
            8218,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            8232,
            8240,
          ],
          "n": Array [
            8232,
            8249,
          ],
          "v": Array [
            8242,
            8249,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name",
        Object {
          "f": 0,
          "k": Array [
            8273,
            8279,
          ],
          "n": Array [
            8273,
            8323,
          ],
          "v": Array [
            8281,
            8323,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            8295,
            8301,
          ],
          "n": Array [
            8295,
            8311,
          ],
          "v": Array [
            8303,
            8311,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml",
        Object {
          "f": 0,
          "k": Array [
            8343,
            8348,
          ],
          "n": Array [
            8343,
            8390,
          ],
          "v": Array [
            8350,
            8390,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml/name",
        Object {
          "f": 0,
          "k": Array [
            8362,
            8368,
          ],
          "n": Array [
            8362,
            8380,
          ],
          "v": Array [
            8370,
            8380,
          ],
        },
      ],
      Array [
        "#/components/schemas/User",
        Object {
          "f": 0,
          "k": Array [
            8406,
            8412,
          ],
          "n": Array [
            8406,
            9160,
          ],
          "v": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag",
        Object {
          "f": 0,
          "k": Array [
            9168,
            9173,
          ],
          "n": Array [
            9168,
            9449,
          ],
          "v": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/type",
        Object {
          "f": 0,
          "k": Array [
            9185,
            9191,
          ],
          "n": Array [
            9185,
            9201,
          ],
          "v": Array [
            9193,
            9201,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties",
        Object {
          "f": 0,
          "k": Array [
            9211,
            9223,
          ],
          "n": Array [
            9211,
            9389,
          ],
          "v": Array [
            9225,
            9389,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id",
        Object {
          "f": 0,
          "k": Array [
            9237,
            9241,
          ],
          "n": Array [
            9237,
            9317,
          ],
          "v": Array [
            9243,
            9317,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            9257,
            9263,
          ],
          "n": Array [
            9257,
            9274,
          ],
          "v": Array [
            9265,
            9274,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            9288,
            9296,
          ],
          "n": Array [
            9288,
            9305,
          ],
          "v": Array [
            9298,
            9305,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name",
        Object {
          "f": 0,
          "k": Array [
            9329,
            9335,
          ],
          "n": Array [
            9329,
            9379,
          ],
          "v": Array [
            9337,
            9379,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            9351,
            9357,
          ],
          "n": Array [
            9351,
            9367,
          ],
          "v": Array [
            9359,
            9367,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml",
        Object {
          "f": 0,
          "k": Array [
            9399,
            9404,
          ],
          "n": Array [
            9399,
            9441,
          ],
          "v": Array [
            9406,
            9441,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9418,
            9424,
          ],
          "n": Array [
            9418,
            9431,
          ],
          "v": Array [
            9426,
            9431,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet",
        Object {
          "f": 0,
          "k": Array [
            9457,
            9462,
          ],
          "n": Array [
            9457,
            10639,
          ],
          "v": Array [
            9464,
            10639,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required",
        Object {
          "f": 0,
          "k": Array [
            9474,
            9484,
          ],
          "n": Array [
            9474,
            9537,
          ],
          "v": Array [
            9486,
            9537,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/0",
        Object {
          "f": 0,
          "n": Array [
            9498,
            9504,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/1",
        Object {
          "f": 0,
          "n": Array [
            9516,
            9527,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/type",
        Object {
          "f": 0,
          "k": Array [
            9547,
            9553,
          ],
          "n": Array [
            9547,
            9563,
          ],
          "v": Array [
            9555,
            9563,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties",
        Object {
          "f": 0,
          "k": Array [
            9573,
            9585,
          ],
          "n": Array [
            9573,
            10579,
          ],
          "v": Array [
            9587,
            10579,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id",
        Object {
          "f": 0,
          "k": Array [
            9599,
            9603,
          ],
          "n": Array [
            9599,
            9679,
          ],
          "v": Array [
            9605,
            9679,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            9619,
            9625,
          ],
          "n": Array [
            9619,
            9636,
          ],
          "v": Array [
            9627,
            9636,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            9650,
            9658,
          ],
          "n": Array [
            9650,
            9667,
          ],
          "v": Array [
            9660,
            9667,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/category",
        Object {
          "f": 0,
          "k": Array [
            8107,
            8117,
          ],
          "n": Array [
            8107,
            8398,
          ],
          "v": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name",
        Object {
          "f": 0,
          "k": Array [
            9780,
            9786,
          ],
          "n": Array [
            9780,
            9863,
          ],
          "v": Array [
            9788,
            9863,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            9802,
            9808,
          ],
          "n": Array [
            9802,
            9818,
          ],
          "v": Array [
            9810,
            9818,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/example",
        Object {
          "f": 0,
          "k": Array [
            9832,
            9841,
          ],
          "n": Array [
            9832,
            9851,
          ],
          "v": Array [
            9843,
            9851,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls",
        Object {
          "f": 0,
          "k": Array [
            9875,
            9886,
          ],
          "n": Array [
            9875,
            10098,
          ],
          "v": Array [
            9888,
            10098,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/type",
        Object {
          "f": 0,
          "k": Array [
            9902,
            9908,
          ],
          "n": Array [
            9902,
            9917,
          ],
          "v": Array [
            9910,
            9917,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml",
        Object {
          "f": 0,
          "k": Array [
            9931,
            9936,
          ],
          "n": Array [
            9931,
            10017,
          ],
          "v": Array [
            9938,
            10017,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9954,
            9960,
          ],
          "n": Array [
            9954,
            9972,
          ],
          "v": Array [
            9962,
            9972,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/wrapped",
        Object {
          "f": 0,
          "k": Array [
            9988,
            9997,
          ],
          "n": Array [
            9988,
            10003,
          ],
          "v": Array [
            9999,
            10003,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items",
        Object {
          "f": 0,
          "k": Array [
            10031,
            10038,
          ],
          "n": Array [
            10031,
            10086,
          ],
          "v": Array [
            10040,
            10086,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items/type",
        Object {
          "f": 0,
          "k": Array [
            10056,
            10062,
          ],
          "n": Array [
            10056,
            10072,
          ],
          "v": Array [
            10064,
            10072,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags",
        Object {
          "f": 0,
          "k": Array [
            10110,
            10116,
          ],
          "n": Array [
            10110,
            10341,
          ],
          "v": Array [
            10118,
            10341,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/type",
        Object {
          "f": 0,
          "k": Array [
            10132,
            10138,
          ],
          "n": Array [
            10132,
            10147,
          ],
          "v": Array [
            10140,
            10147,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml",
        Object {
          "f": 0,
          "k": Array [
            10161,
            10166,
          ],
          "n": Array [
            10161,
            10242,
          ],
          "v": Array [
            10168,
            10242,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/name",
        Object {
          "f": 0,
          "k": Array [
            10184,
            10190,
          ],
          "n": Array [
            10184,
            10197,
          ],
          "v": Array [
            10192,
            10197,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/wrapped",
        Object {
          "f": 0,
          "k": Array [
            10213,
            10222,
          ],
          "n": Array [
            10213,
            10228,
          ],
          "v": Array [
            10224,
            10228,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/items",
        Object {
          "f": 0,
          "k": Array [
            9168,
            9173,
          ],
          "n": Array [
            9168,
            9449,
          ],
          "v": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status",
        Object {
          "f": 0,
          "k": Array [
            10353,
            10361,
          ],
          "n": Array [
            10353,
            10569,
          ],
          "v": Array [
            10363,
            10569,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/type",
        Object {
          "f": 0,
          "k": Array [
            10377,
            10383,
          ],
          "n": Array [
            10377,
            10393,
          ],
          "v": Array [
            10385,
            10393,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/description",
        Object {
          "f": 0,
          "k": Array [
            10407,
            10420,
          ],
          "n": Array [
            10407,
            10447,
          ],
          "v": Array [
            10422,
            10447,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum",
        Object {
          "f": 0,
          "k": Array [
            10461,
            10467,
          ],
          "n": Array [
            10461,
            10557,
          ],
          "v": Array [
            10469,
            10557,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/0",
        Object {
          "f": 0,
          "n": Array [
            10485,
            10496,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/1",
        Object {
          "f": 0,
          "n": Array [
            10512,
            10521,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/2",
        Object {
          "f": 0,
          "n": Array [
            10537,
            10543,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml",
        Object {
          "f": 0,
          "k": Array [
            10589,
            10594,
          ],
          "n": Array [
            10589,
            10631,
          ],
          "v": Array [
            10596,
            10631,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml/name",
        Object {
          "f": 0,
          "k": Array [
            10608,
            10614,
          ],
          "n": Array [
            10608,
            10621,
          ],
          "v": Array [
            10616,
            10621,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse",
        Object {
          "f": 0,
          "k": Array [
            10647,
            10660,
          ],
          "n": Array [
            10647,
            10951,
          ],
          "v": Array [
            10662,
            10951,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/type",
        Object {
          "f": 0,
          "k": Array [
            10672,
            10678,
          ],
          "n": Array [
            10672,
            10688,
          ],
          "v": Array [
            10680,
            10688,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties",
        Object {
          "f": 0,
          "k": Array [
            10698,
            10710,
          ],
          "n": Array [
            10698,
            10943,
          ],
          "v": Array [
            10712,
            10943,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code",
        Object {
          "f": 0,
          "k": Array [
            10724,
            10730,
          ],
          "n": Array [
            10724,
            10806,
          ],
          "v": Array [
            10732,
            10806,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code/type",
        Object {
          "f": 0,
          "k": Array [
            10746,
            10752,
          ],
          "n": Array [
            10746,
            10763,
          ],
          "v": Array [
            10754,
            10763,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/code/format",
        Object {
          "f": 0,
          "k": Array [
            10777,
            10785,
          ],
          "n": Array [
            10777,
            10794,
          ],
          "v": Array [
            10787,
            10794,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/type",
        Object {
          "f": 0,
          "k": Array [
            10818,
            10824,
          ],
          "n": Array [
            10818,
            10868,
          ],
          "v": Array [
            10826,
            10868,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/type/type",
        Object {
          "f": 0,
          "k": Array [
            10840,
            10846,
          ],
          "n": Array [
            10840,
            10856,
          ],
          "v": Array [
            10848,
            10856,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/message",
        Object {
          "f": 0,
          "k": Array [
            10880,
            10889,
          ],
          "n": Array [
            10880,
            10933,
          ],
          "v": Array [
            10891,
            10933,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse/properties/message/type",
        Object {
          "f": 0,
          "k": Array [
            10905,
            10911,
          ],
          "n": Array [
            10905,
            10921,
          ],
          "v": Array [
            10913,
            10921,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes",
        Object {
          "f": 0,
          "k": Array [
            10963,
            10980,
          ],
          "n": Array [
            10963,
            11433,
          ],
          "v": Array [
            10982,
            11433,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth",
        Object {
          "f": 0,
          "k": Array [
            10990,
            11005,
          ],
          "n": Array [
            10990,
            11323,
          ],
          "v": Array [
            11007,
            11323,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/type",
        Object {
          "f": 0,
          "k": Array [
            11017,
            11023,
          ],
          "n": Array [
            11017,
            11033,
          ],
          "v": Array [
            11025,
            11033,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows",
        Object {
          "f": 0,
          "k": Array [
            11043,
            11050,
          ],
          "n": Array [
            11043,
            11315,
          ],
          "v": Array [
            11052,
            11315,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit",
        Object {
          "f": 0,
          "k": Array [
            11064,
            11074,
          ],
          "n": Array [
            11064,
            11305,
          ],
          "v": Array [
            11076,
            11305,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/authorizationUrl",
        Object {
          "f": 0,
          "k": Array [
            11090,
            11108,
          ],
          "n": Array [
            11090,
            11151,
          ],
          "v": Array [
            11110,
            11151,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/scopes",
        Object {
          "f": 0,
          "k": Array [
            11165,
            11173,
          ],
          "n": Array [
            11165,
            11293,
          ],
          "v": Array [
            11175,
            11293,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key",
        Object {
          "f": 0,
          "k": Array [
            11331,
            11340,
          ],
          "n": Array [
            11331,
            11427,
          ],
          "v": Array [
            11342,
            11427,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/type",
        Object {
          "f": 0,
          "k": Array [
            11352,
            11358,
          ],
          "n": Array [
            11352,
            11368,
          ],
          "v": Array [
            11360,
            11368,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/name",
        Object {
          "f": 0,
          "k": Array [
            11378,
            11384,
          ],
          "n": Array [
            11378,
            11395,
          ],
          "v": Array [
            11386,
            11395,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/in",
        Object {
          "f": 0,
          "k": Array [
            11405,
            11409,
          ],
          "n": Array [
            11405,
            11419,
          ],
          "v": Array [
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
          "f": 0,
          "n": Array [
            0,
            11440,
          ],
        },
      ],
      Array [
        "#/openapi",
        Object {
          "f": 0,
          "k": Array [
            4,
            13,
          ],
          "n": Array [
            4,
            22,
          ],
          "v": Array [
            15,
            22,
          ],
        },
      ],
      Array [
        "#/info",
        Object {
          "f": 0,
          "k": Array [
            26,
            32,
          ],
          "n": Array [
            26,
            625,
          ],
          "v": Array [
            34,
            625,
          ],
        },
      ],
      Array [
        "#/info/title",
        Object {
          "f": 0,
          "k": Array [
            40,
            47,
          ],
          "n": Array [
            40,
            67,
          ],
          "v": Array [
            49,
            67,
          ],
        },
      ],
      Array [
        "#/info/description",
        Object {
          "f": 0,
          "k": Array [
            73,
            86,
          ],
          "n": Array [
            73,
            372,
          ],
          "v": Array [
            88,
            372,
          ],
        },
      ],
      Array [
        "#/info/termsOfService",
        Object {
          "f": 0,
          "k": Array [
            378,
            394,
          ],
          "n": Array [
            378,
            422,
          ],
          "v": Array [
            396,
            422,
          ],
        },
      ],
      Array [
        "#/info/contact",
        Object {
          "f": 0,
          "k": Array [
            428,
            437,
          ],
          "n": Array [
            428,
            482,
          ],
          "v": Array [
            439,
            482,
          ],
        },
      ],
      Array [
        "#/info/contact/email",
        Object {
          "f": 0,
          "k": Array [
            447,
            454,
          ],
          "n": Array [
            447,
            476,
          ],
          "v": Array [
            456,
            476,
          ],
        },
      ],
      Array [
        "#/info/license",
        Object {
          "f": 0,
          "k": Array [
            488,
            497,
          ],
          "n": Array [
            488,
            597,
          ],
          "v": Array [
            499,
            597,
          ],
        },
      ],
      Array [
        "#/info/license/name",
        Object {
          "f": 0,
          "k": Array [
            507,
            513,
          ],
          "n": Array [
            507,
            527,
          ],
          "v": Array [
            515,
            527,
          ],
        },
      ],
      Array [
        "#/info/license/url",
        Object {
          "f": 0,
          "k": Array [
            535,
            540,
          ],
          "n": Array [
            535,
            591,
          ],
          "v": Array [
            542,
            591,
          ],
        },
      ],
      Array [
        "#/info/version",
        Object {
          "f": 0,
          "k": Array [
            603,
            612,
          ],
          "n": Array [
            603,
            621,
          ],
          "v": Array [
            614,
            621,
          ],
        },
      ],
      Array [
        "#/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            629,
            643,
          ],
          "n": Array [
            629,
            731,
          ],
          "v": Array [
            645,
            731,
          ],
        },
      ],
      Array [
        "#/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            651,
            664,
          ],
          "n": Array [
            651,
            695,
          ],
          "v": Array [
            666,
            695,
          ],
        },
      ],
      Array [
        "#/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            701,
            706,
          ],
          "n": Array [
            701,
            727,
          ],
          "v": Array [
            708,
            727,
          ],
        },
      ],
      Array [
        "#/servers",
        Object {
          "f": 0,
          "k": Array [
            735,
            744,
          ],
          "n": Array [
            735,
            867,
          ],
          "v": Array [
            746,
            867,
          ],
        },
      ],
      Array [
        "#/servers/0",
        Object {
          "f": 0,
          "n": Array [
            752,
            805,
          ],
        },
      ],
      Array [
        "#/servers/0/url",
        Object {
          "f": 0,
          "k": Array [
            760,
            765,
          ],
          "n": Array [
            760,
            799,
          ],
          "v": Array [
            767,
            799,
          ],
        },
      ],
      Array [
        "#/servers/1",
        Object {
          "f": 0,
          "n": Array [
            811,
            863,
          ],
        },
      ],
      Array [
        "#/servers/1/url",
        Object {
          "f": 0,
          "k": Array [
            819,
            824,
          ],
          "n": Array [
            819,
            857,
          ],
          "v": Array [
            826,
            857,
          ],
        },
      ],
      Array [
        "#/tags",
        Object {
          "f": 0,
          "k": Array [
            871,
            877,
          ],
          "n": Array [
            871,
            1364,
          ],
          "v": Array [
            879,
            1364,
          ],
        },
      ],
      Array [
        "#/tags/0",
        Object {
          "f": 0,
          "n": Array [
            885,
            1071,
          ],
        },
      ],
      Array [
        "#/tags/0/name",
        Object {
          "f": 0,
          "k": Array [
            893,
            899,
          ],
          "n": Array [
            893,
            906,
          ],
          "v": Array [
            901,
            906,
          ],
        },
      ],
      Array [
        "#/tags/0/description",
        Object {
          "f": 0,
          "k": Array [
            914,
            927,
          ],
          "n": Array [
            914,
            957,
          ],
          "v": Array [
            929,
            957,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            965,
            979,
          ],
          "n": Array [
            965,
            1065,
          ],
          "v": Array [
            981,
            1065,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            991,
            1004,
          ],
          "n": Array [
            991,
            1021,
          ],
          "v": Array [
            1006,
            1021,
          ],
        },
      ],
      Array [
        "#/tags/0/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            1031,
            1036,
          ],
          "n": Array [
            1031,
            1057,
          ],
          "v": Array [
            1038,
            1057,
          ],
        },
      ],
      Array [
        "#/tags/1",
        Object {
          "f": 0,
          "n": Array [
            1077,
            1156,
          ],
        },
      ],
      Array [
        "#/tags/1/name",
        Object {
          "f": 0,
          "k": Array [
            1085,
            1091,
          ],
          "n": Array [
            1085,
            1100,
          ],
          "v": Array [
            1093,
            1100,
          ],
        },
      ],
      Array [
        "#/tags/1/description",
        Object {
          "f": 0,
          "k": Array [
            1108,
            1121,
          ],
          "n": Array [
            1108,
            1150,
          ],
          "v": Array [
            1123,
            1150,
          ],
        },
      ],
      Array [
        "#/tags/2",
        Object {
          "f": 0,
          "n": Array [
            1162,
            1360,
          ],
        },
      ],
      Array [
        "#/tags/2/name",
        Object {
          "f": 0,
          "k": Array [
            1170,
            1176,
          ],
          "n": Array [
            1170,
            1184,
          ],
          "v": Array [
            1178,
            1184,
          ],
        },
      ],
      Array [
        "#/tags/2/description",
        Object {
          "f": 0,
          "k": Array [
            1192,
            1205,
          ],
          "n": Array [
            1192,
            1230,
          ],
          "v": Array [
            1207,
            1230,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs",
        Object {
          "f": 0,
          "k": Array [
            1238,
            1252,
          ],
          "n": Array [
            1238,
            1354,
          ],
          "v": Array [
            1254,
            1354,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/description",
        Object {
          "f": 0,
          "k": Array [
            1264,
            1277,
          ],
          "n": Array [
            1264,
            1310,
          ],
          "v": Array [
            1279,
            1310,
          ],
        },
      ],
      Array [
        "#/tags/2/externalDocs/url",
        Object {
          "f": 0,
          "k": Array [
            1320,
            1325,
          ],
          "n": Array [
            1320,
            1346,
          ],
          "v": Array [
            1327,
            1346,
          ],
        },
      ],
      Array [
        "#/paths",
        Object {
          "f": 0,
          "k": Array [
            1368,
            1375,
          ],
          "n": Array [
            1368,
            7222,
          ],
          "v": Array [
            1377,
            7222,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema",
        Object {
          "f": 0,
          "k": Array [
            10647,
            10660,
          ],
          "n": Array [
            10647,
            10951,
          ],
          "v": Array [
            10662,
            10951,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/type",
        Object {
          "f": 0,
          "k": Array [
            10672,
            10678,
          ],
          "n": Array [
            10672,
            10688,
          ],
          "v": Array [
            10680,
            10688,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties",
        Object {
          "f": 0,
          "k": Array [
            10698,
            10710,
          ],
          "n": Array [
            10698,
            10943,
          ],
          "v": Array [
            10712,
            10943,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code",
        Object {
          "f": 0,
          "k": Array [
            10724,
            10730,
          ],
          "n": Array [
            10724,
            10806,
          ],
          "v": Array [
            10732,
            10806,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code/type",
        Object {
          "f": 0,
          "k": Array [
            10746,
            10752,
          ],
          "n": Array [
            10746,
            10763,
          ],
          "v": Array [
            10754,
            10763,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/code/format",
        Object {
          "f": 0,
          "k": Array [
            10777,
            10785,
          ],
          "n": Array [
            10777,
            10794,
          ],
          "v": Array [
            10787,
            10794,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/type",
        Object {
          "f": 0,
          "k": Array [
            10818,
            10824,
          ],
          "n": Array [
            10818,
            10868,
          ],
          "v": Array [
            10826,
            10868,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/type/type",
        Object {
          "f": 0,
          "k": Array [
            10840,
            10846,
          ],
          "n": Array [
            10840,
            10856,
          ],
          "v": Array [
            10848,
            10856,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/message",
        Object {
          "f": 0,
          "k": Array [
            10880,
            10889,
          ],
          "n": Array [
            10880,
            10933,
          ],
          "v": Array [
            10891,
            10933,
          ],
        },
      ],
      Array [
        "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties/message/type",
        Object {
          "f": 0,
          "k": Array [
            10905,
            10911,
          ],
          "n": Array [
            10905,
            10921,
          ],
          "v": Array [
            10913,
            10921,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema",
        Object {
          "f": 0,
          "k": Array [
            7265,
            7272,
          ],
          "n": Array [
            7265,
            8099,
          ],
          "v": Array [
            7274,
            8099,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/type",
        Object {
          "f": 0,
          "k": Array [
            7284,
            7290,
          ],
          "n": Array [
            7284,
            7300,
          ],
          "v": Array [
            7292,
            7300,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties",
        Object {
          "f": 0,
          "k": Array [
            7310,
            7322,
          ],
          "n": Array [
            7310,
            8037,
          ],
          "v": Array [
            7324,
            8037,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id",
        Object {
          "f": 0,
          "k": Array [
            7336,
            7340,
          ],
          "n": Array [
            7336,
            7416,
          ],
          "v": Array [
            7342,
            7416,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            7356,
            7362,
          ],
          "n": Array [
            7356,
            7373,
          ],
          "v": Array [
            7364,
            7373,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            7387,
            7395,
          ],
          "n": Array [
            7387,
            7404,
          ],
          "v": Array [
            7397,
            7404,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId",
        Object {
          "f": 0,
          "k": Array [
            7428,
            7435,
          ],
          "n": Array [
            7428,
            7511,
          ],
          "v": Array [
            7437,
            7511,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId/type",
        Object {
          "f": 0,
          "k": Array [
            7451,
            7457,
          ],
          "n": Array [
            7451,
            7468,
          ],
          "v": Array [
            7459,
            7468,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId/format",
        Object {
          "f": 0,
          "k": Array [
            7482,
            7490,
          ],
          "n": Array [
            7482,
            7499,
          ],
          "v": Array [
            7492,
            7499,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity",
        Object {
          "f": 0,
          "k": Array [
            7523,
            7533,
          ],
          "n": Array [
            7523,
            7609,
          ],
          "v": Array [
            7535,
            7609,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity/type",
        Object {
          "f": 0,
          "k": Array [
            7549,
            7555,
          ],
          "n": Array [
            7549,
            7566,
          ],
          "v": Array [
            7557,
            7566,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity/format",
        Object {
          "f": 0,
          "k": Array [
            7580,
            7588,
          ],
          "n": Array [
            7580,
            7597,
          ],
          "v": Array [
            7590,
            7597,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate",
        Object {
          "f": 0,
          "k": Array [
            7621,
            7631,
          ],
          "n": Array [
            7621,
            7710,
          ],
          "v": Array [
            7633,
            7710,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate/type",
        Object {
          "f": 0,
          "k": Array [
            7647,
            7653,
          ],
          "n": Array [
            7647,
            7663,
          ],
          "v": Array [
            7655,
            7663,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate/format",
        Object {
          "f": 0,
          "k": Array [
            7677,
            7685,
          ],
          "n": Array [
            7677,
            7698,
          ],
          "v": Array [
            7687,
            7698,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status",
        Object {
          "f": 0,
          "k": Array [
            7722,
            7730,
          ],
          "n": Array [
            7722,
            7930,
          ],
          "v": Array [
            7732,
            7930,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/type",
        Object {
          "f": 0,
          "k": Array [
            7746,
            7752,
          ],
          "n": Array [
            7746,
            7762,
          ],
          "v": Array [
            7754,
            7762,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/description",
        Object {
          "f": 0,
          "k": Array [
            7776,
            7789,
          ],
          "n": Array [
            7776,
            7805,
          ],
          "v": Array [
            7791,
            7805,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum",
        Object {
          "f": 0,
          "k": Array [
            7819,
            7825,
          ],
          "n": Array [
            7819,
            7918,
          ],
          "v": Array [
            7827,
            7918,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/0",
        Object {
          "f": 0,
          "n": Array [
            7843,
            7851,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/1",
        Object {
          "f": 0,
          "n": Array [
            7867,
            7877,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status/enum/2",
        Object {
          "f": 0,
          "n": Array [
            7893,
            7904,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete",
        Object {
          "f": 0,
          "k": Array [
            7942,
            7952,
          ],
          "n": Array [
            7942,
            8027,
          ],
          "v": Array [
            7954,
            8027,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete/type",
        Object {
          "f": 0,
          "k": Array [
            7968,
            7974,
          ],
          "n": Array [
            7968,
            7985,
          ],
          "v": Array [
            7976,
            7985,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete/default",
        Object {
          "f": 0,
          "k": Array [
            7999,
            8008,
          ],
          "n": Array [
            7999,
            8015,
          ],
          "v": Array [
            8010,
            8015,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/xml",
        Object {
          "f": 0,
          "k": Array [
            8047,
            8052,
          ],
          "n": Array [
            8047,
            8091,
          ],
          "v": Array [
            8054,
            8091,
          ],
        },
      ],
      Array [
        "#/paths/~1store~1order/post/requestBody/content/*~1*/schema/xml/name",
        Object {
          "f": 0,
          "k": Array [
            8066,
            8072,
          ],
          "n": Array [
            8066,
            8081,
          ],
          "v": Array [
            8074,
            8081,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema",
        Object {
          "f": 0,
          "k": Array [
            8406,
            8412,
          ],
          "n": Array [
            8406,
            9160,
          ],
          "v": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/type",
        Object {
          "f": 0,
          "k": Array [
            8424,
            8430,
          ],
          "n": Array [
            8424,
            8440,
          ],
          "v": Array [
            8432,
            8440,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties",
        Object {
          "f": 0,
          "k": Array [
            8450,
            8462,
          ],
          "n": Array [
            8450,
            9099,
          ],
          "v": Array [
            8464,
            9099,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id",
        Object {
          "f": 0,
          "k": Array [
            8476,
            8480,
          ],
          "n": Array [
            8476,
            8556,
          ],
          "v": Array [
            8482,
            8556,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            8496,
            8502,
          ],
          "n": Array [
            8496,
            8513,
          ],
          "v": Array [
            8504,
            8513,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            8527,
            8535,
          ],
          "n": Array [
            8527,
            8544,
          ],
          "v": Array [
            8537,
            8544,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/username",
        Object {
          "f": 0,
          "k": Array [
            8568,
            8578,
          ],
          "n": Array [
            8568,
            8622,
          ],
          "v": Array [
            8580,
            8622,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/username/type",
        Object {
          "f": 0,
          "k": Array [
            8594,
            8600,
          ],
          "n": Array [
            8594,
            8610,
          ],
          "v": Array [
            8602,
            8610,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName",
        Object {
          "f": 0,
          "k": Array [
            8634,
            8645,
          ],
          "n": Array [
            8634,
            8689,
          ],
          "v": Array [
            8647,
            8689,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName/type",
        Object {
          "f": 0,
          "k": Array [
            8661,
            8667,
          ],
          "n": Array [
            8661,
            8677,
          ],
          "v": Array [
            8669,
            8677,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName",
        Object {
          "f": 0,
          "k": Array [
            8701,
            8711,
          ],
          "n": Array [
            8701,
            8755,
          ],
          "v": Array [
            8713,
            8755,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName/type",
        Object {
          "f": 0,
          "k": Array [
            8727,
            8733,
          ],
          "n": Array [
            8727,
            8743,
          ],
          "v": Array [
            8735,
            8743,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/email",
        Object {
          "f": 0,
          "k": Array [
            8767,
            8774,
          ],
          "n": Array [
            8767,
            8818,
          ],
          "v": Array [
            8776,
            8818,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/email/type",
        Object {
          "f": 0,
          "k": Array [
            8790,
            8796,
          ],
          "n": Array [
            8790,
            8806,
          ],
          "v": Array [
            8798,
            8806,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/password",
        Object {
          "f": 0,
          "k": Array [
            8830,
            8840,
          ],
          "n": Array [
            8830,
            8884,
          ],
          "v": Array [
            8842,
            8884,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/password/type",
        Object {
          "f": 0,
          "k": Array [
            8856,
            8862,
          ],
          "n": Array [
            8856,
            8872,
          ],
          "v": Array [
            8864,
            8872,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone",
        Object {
          "f": 0,
          "k": Array [
            8896,
            8903,
          ],
          "n": Array [
            8896,
            8947,
          ],
          "v": Array [
            8905,
            8947,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone/type",
        Object {
          "f": 0,
          "k": Array [
            8919,
            8925,
          ],
          "n": Array [
            8919,
            8935,
          ],
          "v": Array [
            8927,
            8935,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus",
        Object {
          "f": 0,
          "k": Array [
            8959,
            8971,
          ],
          "n": Array [
            8959,
            9089,
          ],
          "v": Array [
            8973,
            9089,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/type",
        Object {
          "f": 0,
          "k": Array [
            8987,
            8993,
          ],
          "n": Array [
            8987,
            9004,
          ],
          "v": Array [
            8995,
            9004,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/description",
        Object {
          "f": 0,
          "k": Array [
            9018,
            9031,
          ],
          "n": Array [
            9018,
            9046,
          ],
          "v": Array [
            9033,
            9046,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus/format",
        Object {
          "f": 0,
          "k": Array [
            9060,
            9068,
          ],
          "n": Array [
            9060,
            9077,
          ],
          "v": Array [
            9070,
            9077,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/xml",
        Object {
          "f": 0,
          "k": Array [
            9109,
            9114,
          ],
          "n": Array [
            9109,
            9152,
          ],
          "v": Array [
            9116,
            9152,
          ],
        },
      ],
      Array [
        "#/paths/~1user/post/requestBody/content/*~1*/schema/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9128,
            9134,
          ],
          "n": Array [
            9128,
            9142,
          ],
          "v": Array [
            9136,
            9142,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList",
        Object {
          "f": 0,
          "k": Array [
            1383,
            1405,
          ],
          "n": Array [
            1383,
            2150,
          ],
          "v": Array [
            1407,
            2150,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post",
        Object {
          "f": 0,
          "k": Array [
            1415,
            1421,
          ],
          "n": Array [
            1415,
            2144,
          ],
          "v": Array [
            1423,
            2144,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags",
        Object {
          "f": 0,
          "k": Array [
            1433,
            1439,
          ],
          "n": Array [
            1433,
            1469,
          ],
          "v": Array [
            1441,
            1469,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/tags/0",
        Object {
          "f": 0,
          "n": Array [
            1453,
            1459,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/summary",
        Object {
          "f": 0,
          "k": Array [
            1479,
            1488,
          ],
          "n": Array [
            1479,
            1536,
          ],
          "v": Array [
            1490,
            1536,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/operationId",
        Object {
          "f": 0,
          "k": Array [
            1546,
            1559,
          ],
          "n": Array [
            1546,
            1587,
          ],
          "v": Array [
            1561,
            1587,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody",
        Object {
          "f": 0,
          "k": Array [
            1597,
            1610,
          ],
          "n": Array [
            1597,
            1943,
          ],
          "v": Array [
            1612,
            1943,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/description",
        Object {
          "f": 0,
          "k": Array [
            1624,
            1637,
          ],
          "n": Array [
            1624,
            1660,
          ],
          "v": Array [
            1639,
            1660,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content",
        Object {
          "f": 0,
          "k": Array [
            1672,
            1681,
          ],
          "n": Array [
            1672,
            1905,
          ],
          "v": Array [
            1683,
            1905,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*",
        Object {
          "f": 0,
          "k": Array [
            1697,
            1702,
          ],
          "n": Array [
            1697,
            1893,
          ],
          "v": Array [
            1704,
            1893,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema",
        Object {
          "f": 0,
          "k": Array [
            1720,
            1728,
          ],
          "n": Array [
            1720,
            1879,
          ],
          "v": Array [
            1730,
            1879,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/type",
        Object {
          "f": 0,
          "k": Array [
            1748,
            1754,
          ],
          "n": Array [
            1748,
            1763,
          ],
          "v": Array [
            1756,
            1763,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/requestBody/required",
        Object {
          "f": 0,
          "k": Array [
            1917,
            1927,
          ],
          "n": Array [
            1917,
            1933,
          ],
          "v": Array [
            1929,
            1933,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses",
        Object {
          "f": 0,
          "k": Array [
            1953,
            1964,
          ],
          "n": Array [
            1953,
            2089,
          ],
          "v": Array [
            1966,
            2089,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default",
        Object {
          "f": 0,
          "k": Array [
            1978,
            1987,
          ],
          "n": Array [
            1978,
            2079,
          ],
          "v": Array [
            1989,
            2079,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/description",
        Object {
          "f": 0,
          "k": Array [
            2003,
            2016,
          ],
          "n": Array [
            2003,
            2040,
          ],
          "v": Array [
            2018,
            2040,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/responses/default/content",
        Object {
          "f": 0,
          "k": Array [
            2054,
            2063,
          ],
          "n": Array [
            2054,
            2067,
          ],
          "v": Array [
            2065,
            2067,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1createWithList/post/x-codegen-request-body-name",
        Object {
          "f": 0,
          "k": Array [
            2099,
            2128,
          ],
          "n": Array [
            2099,
            2136,
          ],
          "v": Array [
            2130,
            2136,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login",
        Object {
          "f": 0,
          "k": Array [
            2156,
            2169,
          ],
          "n": Array [
            2156,
            3910,
          ],
          "v": Array [
            2171,
            3910,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get",
        Object {
          "f": 0,
          "k": Array [
            2179,
            2184,
          ],
          "n": Array [
            2179,
            3904,
          ],
          "v": Array [
            2186,
            3904,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags",
        Object {
          "f": 0,
          "k": Array [
            2196,
            2202,
          ],
          "n": Array [
            2196,
            2232,
          ],
          "v": Array [
            2204,
            2232,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/tags/0",
        Object {
          "f": 0,
          "n": Array [
            2216,
            2222,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/summary",
        Object {
          "f": 0,
          "k": Array [
            2242,
            2251,
          ],
          "n": Array [
            2242,
            2280,
          ],
          "v": Array [
            2253,
            2280,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/operationId",
        Object {
          "f": 0,
          "k": Array [
            2290,
            2303,
          ],
          "n": Array [
            2290,
            2316,
          ],
          "v": Array [
            2305,
            2316,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters",
        Object {
          "f": 0,
          "k": Array [
            2326,
            2338,
          ],
          "n": Array [
            2326,
            2837,
          ],
          "v": Array [
            2340,
            2837,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0",
        Object {
          "f": 0,
          "n": Array [
            2352,
            2577,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/name",
        Object {
          "f": 0,
          "k": Array [
            2366,
            2372,
          ],
          "n": Array [
            2366,
            2384,
          ],
          "v": Array [
            2374,
            2384,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/in",
        Object {
          "f": 0,
          "k": Array [
            2398,
            2402,
          ],
          "n": Array [
            2398,
            2411,
          ],
          "v": Array [
            2404,
            2411,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/description",
        Object {
          "f": 0,
          "k": Array [
            2425,
            2438,
          ],
          "n": Array [
            2425,
            2465,
          ],
          "v": Array [
            2440,
            2465,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/required",
        Object {
          "f": 0,
          "k": Array [
            2479,
            2489,
          ],
          "n": Array [
            2479,
            2495,
          ],
          "v": Array [
            2491,
            2495,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema",
        Object {
          "f": 0,
          "k": Array [
            2509,
            2517,
          ],
          "n": Array [
            2509,
            2565,
          ],
          "v": Array [
            2519,
            2565,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/0/schema/type",
        Object {
          "f": 0,
          "k": Array [
            2535,
            2541,
          ],
          "n": Array [
            2535,
            2551,
          ],
          "v": Array [
            2543,
            2551,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1",
        Object {
          "f": 0,
          "n": Array [
            2589,
            2827,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/name",
        Object {
          "f": 0,
          "k": Array [
            2603,
            2609,
          ],
          "n": Array [
            2603,
            2621,
          ],
          "v": Array [
            2611,
            2621,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/in",
        Object {
          "f": 0,
          "k": Array [
            2635,
            2639,
          ],
          "n": Array [
            2635,
            2648,
          ],
          "v": Array [
            2641,
            2648,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/description",
        Object {
          "f": 0,
          "k": Array [
            2662,
            2675,
          ],
          "n": Array [
            2662,
            2715,
          ],
          "v": Array [
            2677,
            2715,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/required",
        Object {
          "f": 0,
          "k": Array [
            2729,
            2739,
          ],
          "n": Array [
            2729,
            2745,
          ],
          "v": Array [
            2741,
            2745,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema",
        Object {
          "f": 0,
          "k": Array [
            2759,
            2767,
          ],
          "n": Array [
            2759,
            2815,
          ],
          "v": Array [
            2769,
            2815,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/parameters/1/schema/type",
        Object {
          "f": 0,
          "k": Array [
            2785,
            2791,
          ],
          "n": Array [
            2785,
            2801,
          ],
          "v": Array [
            2793,
            2801,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1login/get/responses",
        Object {
          "f": 0,
          "k": Array [
            2847,
            2858,
          ],
          "n": Array [
            2847,
            3896,
          ],
          "v": Array [
            2860,
            3896,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout",
        Object {
          "f": 0,
          "k": Array [
            3916,
            3930,
          ],
          "n": Array [
            3916,
            4252,
          ],
          "v": Array [
            3932,
            4252,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get",
        Object {
          "f": 0,
          "k": Array [
            3940,
            3945,
          ],
          "n": Array [
            3940,
            4246,
          ],
          "v": Array [
            3947,
            4246,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags",
        Object {
          "f": 0,
          "k": Array [
            3957,
            3963,
          ],
          "n": Array [
            3957,
            3993,
          ],
          "v": Array [
            3965,
            3993,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/tags/0",
        Object {
          "f": 0,
          "n": Array [
            3977,
            3983,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/summary",
        Object {
          "f": 0,
          "k": Array [
            4003,
            4012,
          ],
          "n": Array [
            4003,
            4055,
          ],
          "v": Array [
            4014,
            4055,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/operationId",
        Object {
          "f": 0,
          "k": Array [
            4065,
            4078,
          ],
          "n": Array [
            4065,
            4092,
          ],
          "v": Array [
            4080,
            4092,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses",
        Object {
          "f": 0,
          "k": Array [
            4102,
            4113,
          ],
          "n": Array [
            4102,
            4238,
          ],
          "v": Array [
            4115,
            4238,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default",
        Object {
          "f": 0,
          "k": Array [
            4127,
            4136,
          ],
          "n": Array [
            4127,
            4228,
          ],
          "v": Array [
            4138,
            4228,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/description",
        Object {
          "f": 0,
          "k": Array [
            4152,
            4165,
          ],
          "n": Array [
            4152,
            4189,
          ],
          "v": Array [
            4167,
            4189,
          ],
        },
      ],
      Array [
        "#/paths/~1user~1logout/get/responses/default/content",
        Object {
          "f": 0,
          "k": Array [
            4203,
            4212,
          ],
          "n": Array [
            4203,
            4216,
          ],
          "v": Array [
            4214,
            4216,
          ],
        },
      ],
      Array [
        "#/components",
        Object {
          "f": 0,
          "k": Array [
            7226,
            7238,
          ],
          "n": Array [
            7226,
            11437,
          ],
          "v": Array [
            7240,
            11437,
          ],
        },
      ],
      Array [
        "#/components/schemas",
        Object {
          "f": 0,
          "k": Array [
            7246,
            7255,
          ],
          "n": Array [
            7246,
            10957,
          ],
          "v": Array [
            7257,
            10957,
          ],
        },
      ],
      Array [
        "#/components/schemas/Order",
        Object {
          "f": 0,
          "k": Array [
            7265,
            7272,
          ],
          "n": Array [
            7265,
            8099,
          ],
          "v": Array [
            7274,
            8099,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category",
        Object {
          "f": 0,
          "k": Array [
            8107,
            8117,
          ],
          "n": Array [
            8107,
            8398,
          ],
          "v": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/type",
        Object {
          "f": 0,
          "k": Array [
            8129,
            8135,
          ],
          "n": Array [
            8129,
            8145,
          ],
          "v": Array [
            8137,
            8145,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties",
        Object {
          "f": 0,
          "k": Array [
            8155,
            8167,
          ],
          "n": Array [
            8155,
            8333,
          ],
          "v": Array [
            8169,
            8333,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id",
        Object {
          "f": 0,
          "k": Array [
            8181,
            8185,
          ],
          "n": Array [
            8181,
            8261,
          ],
          "v": Array [
            8187,
            8261,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            8201,
            8207,
          ],
          "n": Array [
            8201,
            8218,
          ],
          "v": Array [
            8209,
            8218,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            8232,
            8240,
          ],
          "n": Array [
            8232,
            8249,
          ],
          "v": Array [
            8242,
            8249,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name",
        Object {
          "f": 0,
          "k": Array [
            8273,
            8279,
          ],
          "n": Array [
            8273,
            8323,
          ],
          "v": Array [
            8281,
            8323,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            8295,
            8301,
          ],
          "n": Array [
            8295,
            8311,
          ],
          "v": Array [
            8303,
            8311,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml",
        Object {
          "f": 0,
          "k": Array [
            8343,
            8348,
          ],
          "n": Array [
            8343,
            8390,
          ],
          "v": Array [
            8350,
            8390,
          ],
        },
      ],
      Array [
        "#/components/schemas/Category/xml/name",
        Object {
          "f": 0,
          "k": Array [
            8362,
            8368,
          ],
          "n": Array [
            8362,
            8380,
          ],
          "v": Array [
            8370,
            8380,
          ],
        },
      ],
      Array [
        "#/components/schemas/User",
        Object {
          "f": 0,
          "k": Array [
            8406,
            8412,
          ],
          "n": Array [
            8406,
            9160,
          ],
          "v": Array [
            8414,
            9160,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag",
        Object {
          "f": 0,
          "k": Array [
            9168,
            9173,
          ],
          "n": Array [
            9168,
            9449,
          ],
          "v": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/type",
        Object {
          "f": 0,
          "k": Array [
            9185,
            9191,
          ],
          "n": Array [
            9185,
            9201,
          ],
          "v": Array [
            9193,
            9201,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties",
        Object {
          "f": 0,
          "k": Array [
            9211,
            9223,
          ],
          "n": Array [
            9211,
            9389,
          ],
          "v": Array [
            9225,
            9389,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id",
        Object {
          "f": 0,
          "k": Array [
            9237,
            9241,
          ],
          "n": Array [
            9237,
            9317,
          ],
          "v": Array [
            9243,
            9317,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            9257,
            9263,
          ],
          "n": Array [
            9257,
            9274,
          ],
          "v": Array [
            9265,
            9274,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            9288,
            9296,
          ],
          "n": Array [
            9288,
            9305,
          ],
          "v": Array [
            9298,
            9305,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name",
        Object {
          "f": 0,
          "k": Array [
            9329,
            9335,
          ],
          "n": Array [
            9329,
            9379,
          ],
          "v": Array [
            9337,
            9379,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            9351,
            9357,
          ],
          "n": Array [
            9351,
            9367,
          ],
          "v": Array [
            9359,
            9367,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml",
        Object {
          "f": 0,
          "k": Array [
            9399,
            9404,
          ],
          "n": Array [
            9399,
            9441,
          ],
          "v": Array [
            9406,
            9441,
          ],
        },
      ],
      Array [
        "#/components/schemas/Tag/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9418,
            9424,
          ],
          "n": Array [
            9418,
            9431,
          ],
          "v": Array [
            9426,
            9431,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet",
        Object {
          "f": 0,
          "k": Array [
            9457,
            9462,
          ],
          "n": Array [
            9457,
            10639,
          ],
          "v": Array [
            9464,
            10639,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required",
        Object {
          "f": 0,
          "k": Array [
            9474,
            9484,
          ],
          "n": Array [
            9474,
            9537,
          ],
          "v": Array [
            9486,
            9537,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/0",
        Object {
          "f": 0,
          "n": Array [
            9498,
            9504,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/required/1",
        Object {
          "f": 0,
          "n": Array [
            9516,
            9527,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/type",
        Object {
          "f": 0,
          "k": Array [
            9547,
            9553,
          ],
          "n": Array [
            9547,
            9563,
          ],
          "v": Array [
            9555,
            9563,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties",
        Object {
          "f": 0,
          "k": Array [
            9573,
            9585,
          ],
          "n": Array [
            9573,
            10579,
          ],
          "v": Array [
            9587,
            10579,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id",
        Object {
          "f": 0,
          "k": Array [
            9599,
            9603,
          ],
          "n": Array [
            9599,
            9679,
          ],
          "v": Array [
            9605,
            9679,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/type",
        Object {
          "f": 0,
          "k": Array [
            9619,
            9625,
          ],
          "n": Array [
            9619,
            9636,
          ],
          "v": Array [
            9627,
            9636,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/id/format",
        Object {
          "f": 0,
          "k": Array [
            9650,
            9658,
          ],
          "n": Array [
            9650,
            9667,
          ],
          "v": Array [
            9660,
            9667,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/category",
        Object {
          "f": 0,
          "k": Array [
            8107,
            8117,
          ],
          "n": Array [
            8107,
            8398,
          ],
          "v": Array [
            8119,
            8398,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name",
        Object {
          "f": 0,
          "k": Array [
            9780,
            9786,
          ],
          "n": Array [
            9780,
            9863,
          ],
          "v": Array [
            9788,
            9863,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/type",
        Object {
          "f": 0,
          "k": Array [
            9802,
            9808,
          ],
          "n": Array [
            9802,
            9818,
          ],
          "v": Array [
            9810,
            9818,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/name/example",
        Object {
          "f": 0,
          "k": Array [
            9832,
            9841,
          ],
          "n": Array [
            9832,
            9851,
          ],
          "v": Array [
            9843,
            9851,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls",
        Object {
          "f": 0,
          "k": Array [
            9875,
            9886,
          ],
          "n": Array [
            9875,
            10098,
          ],
          "v": Array [
            9888,
            10098,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/type",
        Object {
          "f": 0,
          "k": Array [
            9902,
            9908,
          ],
          "n": Array [
            9902,
            9917,
          ],
          "v": Array [
            9910,
            9917,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml",
        Object {
          "f": 0,
          "k": Array [
            9931,
            9936,
          ],
          "n": Array [
            9931,
            10017,
          ],
          "v": Array [
            9938,
            10017,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/name",
        Object {
          "f": 0,
          "k": Array [
            9954,
            9960,
          ],
          "n": Array [
            9954,
            9972,
          ],
          "v": Array [
            9962,
            9972,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/xml/wrapped",
        Object {
          "f": 0,
          "k": Array [
            9988,
            9997,
          ],
          "n": Array [
            9988,
            10003,
          ],
          "v": Array [
            9999,
            10003,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items",
        Object {
          "f": 0,
          "k": Array [
            10031,
            10038,
          ],
          "n": Array [
            10031,
            10086,
          ],
          "v": Array [
            10040,
            10086,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/photoUrls/items/type",
        Object {
          "f": 0,
          "k": Array [
            10056,
            10062,
          ],
          "n": Array [
            10056,
            10072,
          ],
          "v": Array [
            10064,
            10072,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags",
        Object {
          "f": 0,
          "k": Array [
            10110,
            10116,
          ],
          "n": Array [
            10110,
            10341,
          ],
          "v": Array [
            10118,
            10341,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/type",
        Object {
          "f": 0,
          "k": Array [
            10132,
            10138,
          ],
          "n": Array [
            10132,
            10147,
          ],
          "v": Array [
            10140,
            10147,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml",
        Object {
          "f": 0,
          "k": Array [
            10161,
            10166,
          ],
          "n": Array [
            10161,
            10242,
          ],
          "v": Array [
            10168,
            10242,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/name",
        Object {
          "f": 0,
          "k": Array [
            10184,
            10190,
          ],
          "n": Array [
            10184,
            10197,
          ],
          "v": Array [
            10192,
            10197,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/xml/wrapped",
        Object {
          "f": 0,
          "k": Array [
            10213,
            10222,
          ],
          "n": Array [
            10213,
            10228,
          ],
          "v": Array [
            10224,
            10228,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/tags/items",
        Object {
          "f": 0,
          "k": Array [
            9168,
            9173,
          ],
          "n": Array [
            9168,
            9449,
          ],
          "v": Array [
            9175,
            9449,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status",
        Object {
          "f": 0,
          "k": Array [
            10353,
            10361,
          ],
          "n": Array [
            10353,
            10569,
          ],
          "v": Array [
            10363,
            10569,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/type",
        Object {
          "f": 0,
          "k": Array [
            10377,
            10383,
          ],
          "n": Array [
            10377,
            10393,
          ],
          "v": Array [
            10385,
            10393,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/description",
        Object {
          "f": 0,
          "k": Array [
            10407,
            10420,
          ],
          "n": Array [
            10407,
            10447,
          ],
          "v": Array [
            10422,
            10447,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum",
        Object {
          "f": 0,
          "k": Array [
            10461,
            10467,
          ],
          "n": Array [
            10461,
            10557,
          ],
          "v": Array [
            10469,
            10557,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/0",
        Object {
          "f": 0,
          "n": Array [
            10485,
            10496,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/1",
        Object {
          "f": 0,
          "n": Array [
            10512,
            10521,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/properties/status/enum/2",
        Object {
          "f": 0,
          "n": Array [
            10537,
            10543,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml",
        Object {
          "f": 0,
          "k": Array [
            10589,
            10594,
          ],
          "n": Array [
            10589,
            10631,
          ],
          "v": Array [
            10596,
            10631,
          ],
        },
      ],
      Array [
        "#/components/schemas/Pet/xml/name",
        Object {
          "f": 0,
          "k": Array [
            10608,
            10614,
          ],
          "n": Array [
            10608,
            10621,
          ],
          "v": Array [
            10616,
            10621,
          ],
        },
      ],
      Array [
        "#/components/schemas/ApiResponse",
        Object {
          "f": 0,
          "k": Array [
            10647,
            10660,
          ],
          "n": Array [
            10647,
            10951,
          ],
          "v": Array [
            10662,
            10951,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes",
        Object {
          "f": 0,
          "k": Array [
            10963,
            10980,
          ],
          "n": Array [
            10963,
            11433,
          ],
          "v": Array [
            10982,
            11433,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth",
        Object {
          "f": 0,
          "k": Array [
            10990,
            11005,
          ],
          "n": Array [
            10990,
            11323,
          ],
          "v": Array [
            11007,
            11323,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/type",
        Object {
          "f": 0,
          "k": Array [
            11017,
            11023,
          ],
          "n": Array [
            11017,
            11033,
          ],
          "v": Array [
            11025,
            11033,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows",
        Object {
          "f": 0,
          "k": Array [
            11043,
            11050,
          ],
          "n": Array [
            11043,
            11315,
          ],
          "v": Array [
            11052,
            11315,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit",
        Object {
          "f": 0,
          "k": Array [
            11064,
            11074,
          ],
          "n": Array [
            11064,
            11305,
          ],
          "v": Array [
            11076,
            11305,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/authorizationUrl",
        Object {
          "f": 0,
          "k": Array [
            11090,
            11108,
          ],
          "n": Array [
            11090,
            11151,
          ],
          "v": Array [
            11110,
            11151,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/petstore_auth/flows/implicit/scopes",
        Object {
          "f": 0,
          "k": Array [
            11165,
            11173,
          ],
          "n": Array [
            11165,
            11293,
          ],
          "v": Array [
            11175,
            11293,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key",
        Object {
          "f": 0,
          "k": Array [
            11331,
            11340,
          ],
          "n": Array [
            11331,
            11427,
          ],
          "v": Array [
            11342,
            11427,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/type",
        Object {
          "f": 0,
          "k": Array [
            11352,
            11358,
          ],
          "n": Array [
            11352,
            11368,
          ],
          "v": Array [
            11360,
            11368,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/name",
        Object {
          "f": 0,
          "k": Array [
            11378,
            11384,
          ],
          "n": Array [
            11378,
            11395,
          ],
          "v": Array [
            11386,
            11395,
          ],
        },
      ],
      Array [
        "#/components/securitySchemes/api_key/in",
        Object {
          "f": 0,
          "k": Array [
            11405,
            11409,
          ],
          "n": Array [
            11405,
            11419,
          ],
          "v": Array [
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
