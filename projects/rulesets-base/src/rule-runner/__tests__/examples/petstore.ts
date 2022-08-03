import { IFact, IChange } from '@useoptic/openapi-utilities';
export const before = [
  {
    location: {
      jsonPath: '',
      conceptualPath: [],
      conceptualLocation: {},
      kind: 'specification',
    },
    value: {
      openapi: '3.0.1',
      info: {
        title: 'Swagger Petstore',
        description:
          'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
        termsOfService: 'http://swagger.io/terms/',
        contact: { email: 'apiteam@swagger.io' },
        license: {
          name: 'Apache 2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
        },
        version: '1.0.0',
      },
      externalDocs: {
        description: 'Find out more about Swagger',
        url: 'http://swagger.io',
      },
      servers: [
        { url: 'https://petstore.swagger.io/v2' },
        { url: 'http://petstore.swagger.io/v2' },
      ],
      tags: [
        {
          name: 'pet',
          description: 'Everything about your Pets',
          externalDocs: {
            description: 'Find out more',
            url: 'http://swagger.io',
          },
        },
        { name: 'store', description: 'Access to Petstore orders' },
        {
          name: 'user',
          description: 'Operations about user',
          externalDocs: {
            description: 'Find out more about our store',
            url: 'http://swagger.io',
          },
        },
      ],
    },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get',
      conceptualPath: ['operations', '/example', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/example' },
    },
    value: {
      operationId: 'getExamples',
      method: 'get',
      pathPattern: '/example',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/stringOrNumberOrObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'stringOrNumberOrObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['stringOrNumberOrObject'],
      },
    },
    value: {
      key: 'stringOrNumberOrObject',
      flatSchema: {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'object', properties: { orderId: { type: 'string' } } },
        ],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/stringOrNumberOrObject/oneOf/2/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'stringOrNumberOrObject',
        'oneOf',
        '2',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['stringOrNumberOrObject', 'orderId'],
      },
    },
    value: { key: 'orderId', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject'],
      },
    },
    value: {
      key: 'composedObject',
      flatSchema: {
        allOf: [
          { type: 'object', properties: { orderId: { type: 'string' } } },
          { type: 'object', properties: { fulfillmentId: { type: 'string' } } },
        ],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject/allOf/0/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
        'allOf',
        '0',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject', 'orderId'],
      },
    },
    value: { key: 'orderId', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject/allOf/1/properties/fulfillmentId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
        'allOf',
        '1',
        'fulfillmentId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject', 'fulfillmentId'],
      },
    },
    value: {
      key: 'fulfillmentId',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject'],
      },
    },
    value: {
      key: 'expandableObject',
      flatSchema: {
        anyOf: [
          { type: 'object', properties: { orderId: { type: 'string' } } },
        ],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/0/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '0',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'orderId'],
      },
    },
    value: { key: 'orderId', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get/responses/200',
      conceptualPath: ['operations', '/example', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'succesful', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get',
      conceptualPath: ['operations', '/pet', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet' },
    },
    value: { method: 'get', pathPattern: '/pet' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get/responses/404',
      conceptualPath: ['operations', '/pet', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get/responses/405',
      conceptualPath: ['operations', '/pet', 'get', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Validation exception', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post',
      conceptualPath: ['operations', '/pet', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet' },
    },
    value: {
      tags: ['pet'],
      summary: 'Add a new pet to the store',
      operationId: 'addPet',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/pet',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody/content/application~1json',
      conceptualPath: ['operations', '/pet', 'post', 'application/json'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'post', 'application/json', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody/content/application~1xml',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody',
      conceptualPath: ['operations', '/pet', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'post', path: '/pet', inRequest: {} },
    },
    value: {
      description: 'Pet object that needs to be added to the store',
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/responses/405',
      conceptualPath: ['operations', '/pet', 'post', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Invalid input', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put',
      conceptualPath: ['operations', '/pet', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/pet' },
    },
    value: { method: 'put', pathPattern: '/pet' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody/content/application~1json',
      conceptualPath: ['operations', '/pet', 'put', 'application/json'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody/content/application~1xml',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody',
      conceptualPath: ['operations', '/pet', 'put', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'put', path: '/pet', inRequest: {} },
    },
    value: {
      description: 'Pet object that needs to be added to the store',
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/400',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/404',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/405',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Validation exception', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post',
      conceptualPath: ['operations', '/pet/{}/uploadImage', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet/{petId}/uploadImage' },
    },
    value: {
      tags: ['pet'],
      summary: 'uploads an image',
      operationId: 'uploadFile',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'post',
      pathPattern: '/pet/{petId}/uploadImage',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: { path: 'petId' },
      },
    },
    value: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet to update',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/requestBody/content/multipart~1form-data',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'multipart/form-data',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: { body: { contentType: 'multipart/form-data' } },
      },
    },
    value: { contentType: 'multipart/form-data', flatSchema: {} },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/requestBody',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: {},
      },
    },
    value: {},
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/200',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/default',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1inventory/get',
      conceptualPath: ['operations', '/store/inventory', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/store/inventory' },
    },
    value: {
      tags: ['store'],
      summary: 'Returns pet inventories by status',
      description: 'Returns a map of status codes to quantities',
      operationId: 'getInventory',
      security: [{ api_key: [] }],
      method: 'get',
      pathPattern: '/store/inventory',
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1inventory/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/inventory',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/inventory',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: {
        type: 'object',
        additionalProperties: { type: 'integer', format: 'int32' },
      },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1inventory/get/responses/200',
      conceptualPath: [
        'operations',
        '/store/inventory',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/inventory',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post',
      conceptualPath: ['operations', '/store/order', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/store/order' },
    },
    value: {
      tags: ['store'],
      summary: 'Place an order for a pet',
      operationId: 'placeOrder',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/store/order',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/store/order', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'petId'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'quantity'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'shipDate'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'status'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'approved', 'delivered'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'complete'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/requestBody',
      conceptualPath: ['operations', '/store/order', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: {},
      },
    },
    value: {
      description: 'order placed for purchasing the pet',
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'approved', 'delivered'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'approved', 'delivered'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/responses/200',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/responses/400',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid Order', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get',
      conceptualPath: ['operations', '/store/order/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/store/order/{orderId}' },
    },
    value: {
      tags: ['store'],
      summary: 'Find purchase order by ID',
      description:
        'For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions',
      operationId: 'getOrderById',
      method: 'get',
      pathPattern: '/store/order/{orderId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'parameters',
        'path',
        'orderId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inRequest: { path: 'orderId' },
      },
    },
    value: {
      name: 'orderId',
      in: 'path',
      description: 'ID of pet that needs to be fetched',
      required: true,
      schema: { maximum: 10, minimum: 1, type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'approved', 'delivered'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'approved', 'delivered'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/200',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/400',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/404',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Order not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete',
      conceptualPath: ['operations', '/store/order/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/store/order/{orderId}' },
    },
    value: {
      tags: ['store'],
      summary: 'Delete purchase order by ID',
      description:
        'For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors',
      operationId: 'deleteOrder',
      method: 'delete',
      pathPattern: '/store/order/{orderId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'parameters',
        'path',
        'orderId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inRequest: { path: 'orderId' },
      },
    },
    value: {
      name: 'orderId',
      in: 'path',
      description: 'ID of the order that needs to be deleted',
      required: true,
      schema: { minimum: 1, type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/responses/400',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/responses/404',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Order not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post',
      conceptualPath: ['operations', '/user', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user' },
    },
    value: {
      tags: ['user'],
      summary: 'Create user',
      description: 'This can only be done by the logged in user.',
      operationId: 'createUser',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'firstName'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/email',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'email'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/password',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'password'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'phone'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/requestBody',
      conceptualPath: ['operations', '/user', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'post', path: '/user', inRequest: {} },
    },
    value: { description: 'Created user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/responses/default',
      conceptualPath: ['operations', '/user', 'post', 'responses', 'default'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post',
      conceptualPath: ['operations', '/user/createWithArray', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user/createWithArray' },
    },
    value: {
      tags: ['user'],
      summary: 'Creates list of users with given input array',
      operationId: 'createUsersWithArrayInput',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user/createWithArray',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/createWithArray', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: { contentType: '*/*', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/email',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/password',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/phone',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/requestBody',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: {},
      },
    },
    value: { description: 'List of user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/responses/default',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post',
      conceptualPath: ['operations', '/user/createWithList', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user/createWithList' },
    },
    value: {
      tags: ['user'],
      summary: 'Creates list of users with given input array',
      operationId: 'createUsersWithListInput',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user/createWithList',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/createWithList', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: { contentType: '*/*', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/requestBody',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: {},
      },
    },
    value: { description: 'List of user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/responses/default',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get',
      conceptualPath: ['operations', '/user/login', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/login' },
    },
    value: {
      tags: ['user'],
      summary: 'Logs user into the system',
      operationId: 'loginUser',
      method: 'get',
      pathPattern: '/user/login',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/parameters/0',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'parameters',
        'query',
        'username',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inRequest: { query: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'query',
      description: 'The user name for login',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/parameters/1',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'parameters',
        'query',
        'password',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inRequest: { query: 'password' },
      },
    },
    value: {
      name: 'password',
      in: 'query',
      description: 'The password for login in clear text',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/headers/X-Expires-After',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'X-Expires-After',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'X-Expires-After' },
      },
    },
    value: {
      name: 'X-Expires-After',
      description: 'date in UTC when token expires',
      schema: { type: 'number' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200/headers/content-type',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'content-type',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'content-type' },
      },
    },
    value: {
      name: 'content-type',
      description: 'the description goes here',
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: { contentType: 'application/xml', flatSchema: { type: 'string' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'string' } },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200',
      conceptualPath: ['operations', '/user/login', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/400',
      conceptualPath: ['operations', '/user/login', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '400' },
      },
    },
    value: {
      description: 'Invalid username/password supplied',
      statusCode: '400',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1logout/get',
      conceptualPath: ['operations', '/user/logout', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/logout' },
    },
    value: {
      tags: ['user'],
      summary: 'Logs out current logged in user session',
      operationId: 'logoutUser',
      method: 'get',
      pathPattern: '/user/logout',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1logout/get/responses/default',
      conceptualPath: [
        'operations',
        '/user/logout',
        'get',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/logout',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get',
      conceptualPath: ['operations', '/user/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Get user by user name',
      operationId: 'getUserByName',
      method: 'get',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'The name that needs to be fetched. Use user1 for testing. ',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/email',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/password',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/phone',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/email',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/password',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/phone',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/200',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/400',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid username supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/404',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put',
      conceptualPath: ['operations', '/user/{}', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Updated user',
      description: 'This can only be done by the logged in user.',
      operationId: 'updateUser',
      'x-codegen-request-body-name': 'body',
      method: 'put',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'put',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'name that need to be updated',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/firstName',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'firstName'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/email',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'email'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/password',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'password'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/phone',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'phone'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['phone'],
      },
    },
    value: { key: 'phone', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'integer',
        description: 'User Status',
        format: 'int32',
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/requestBody',
      conceptualPath: ['operations', '/user/{}', 'put', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: {},
      },
    },
    value: { description: 'Updated user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/responses/400',
      conceptualPath: ['operations', '/user/{}', 'put', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid user supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/responses/404',
      conceptualPath: ['operations', '/user/{}', 'put', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete',
      conceptualPath: ['operations', '/user/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Delete user',
      description: 'This can only be done by the logged in user.',
      operationId: 'deleteUser',
      method: 'delete',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'delete',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'The name that needs to be deleted',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/responses/400',
      conceptualPath: ['operations', '/user/{}', 'delete', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid username supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/responses/404',
      conceptualPath: ['operations', '/user/{}', 'delete', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
] as IFact[];
export const after = [
  {
    location: {
      jsonPath: '',
      conceptualPath: [],
      conceptualLocation: {},
      kind: 'specification',
    },
    value: {
      openapi: '3.0.1',
      info: {
        title: 'Swagger Petstore Updated',
        description:
          'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
        termsOfService: 'http://swagger.io/terms/',
        contact: { email: 'apiteam@swagger.io' },
        license: {
          name: 'Apache 2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
        },
        version: '1.0.0',
      },
      externalDocs: {
        description: 'Find out more about Swagger',
        url: 'http://swagger.io',
      },
      servers: [
        { url: 'https://petstore.swagger.io/v2' },
        { url: 'http://petstore.swagger.io/v2' },
        { url: 'http://petstore.swagger.io/v3' },
      ],
      tags: [
        {
          name: 'pet',
          description: 'Everything about your Pets',
          externalDocs: {
            description: 'Find out more',
            url: 'http://swagger.io',
          },
        },
        { name: 'store', description: 'Access to Petstore orders' },
        {
          name: 'user',
          description: 'Operations about user',
          externalDocs: {
            description: 'Find out more about our store',
            url: 'http://swagger.io',
          },
        },
      ],
    },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get',
      conceptualPath: ['operations', '/example', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/example' },
    },
    value: {
      operationId: 'getExamples',
      method: 'get',
      pathPattern: '/example',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/stringOrNumberOrObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'stringOrNumberOrObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['stringOrNumberOrObject'],
      },
    },
    value: {
      key: 'stringOrNumberOrObject',
      flatSchema: { oneOf: [{ type: 'string' }, { type: 'number' }] },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject'],
      },
    },
    value: {
      key: 'composedObject',
      flatSchema: {
        allOf: [
          { type: 'object', properties: { orderId: { type: 'number' } } },
          { type: 'object', properties: { fulfillmentId: { type: 'string' } } },
        ],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject/allOf/0/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
        'allOf',
        '0',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject', 'orderId'],
      },
    },
    value: { key: 'orderId', flatSchema: { type: 'number' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject/allOf/1/properties/fulfillmentId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
        'allOf',
        '1',
        'fulfillmentId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject', 'fulfillmentId'],
      },
    },
    value: {
      key: 'fulfillmentId',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject'],
      },
    },
    value: {
      key: 'expandableObject',
      flatSchema: {
        anyOf: [
          { type: 'object', properties: { orderId: { type: 'string' } } },
          {
            type: 'object',
            properties: {
              order: { type: 'object', properties: { id: { type: 'string' } } },
            },
          },
        ],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/0/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '0',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'orderId'],
      },
    },
    value: { key: 'orderId', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/1/properties/order',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '1',
        'order',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'order'],
      },
    },
    value: { key: 'order', flatSchema: { type: 'object' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/1/properties/order/properties/id',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '1',
        'order',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'order', 'id'],
      },
    },
    value: { key: 'id', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1example/get/responses/200',
      conceptualPath: ['operations', '/example', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'succesful', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post',
      conceptualPath: ['operations', '/pet', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet' },
    },
    value: {
      tags: ['pet'],
      summary: 'Add a new pet to the store',
      operationId: 'addPet-change',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/pet',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody/content/application~1json',
      conceptualPath: ['operations', '/pet', 'post', 'application/json'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'post', 'application/json', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody/content/application~1xml',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'post', 'application/xml', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/post/requestBody/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'post',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/requestBody',
      conceptualPath: ['operations', '/pet', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'post', path: '/pet', inRequest: {} },
    },
    value: {
      description: 'Pet object that needs to be added to the store',
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post/responses/405',
      conceptualPath: ['operations', '/pet', 'post', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Invalid input', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put',
      conceptualPath: ['operations', '/pet', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/pet' },
    },
    value: { method: 'put', pathPattern: '/pet' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody/content/application~1json',
      conceptualPath: ['operations', '/pet', 'put', 'application/json'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/number',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'number',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['number'],
      },
    },
    value: { key: 'number', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody',
      conceptualPath: ['operations', '/pet', 'put', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'put', path: '/pet', inRequest: {} },
    },
    value: {
      description: 'Pet object that needs to be added to the store',
      required: true,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/404',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/405',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Validation exception', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get',
      conceptualPath: ['operations', '/pet/findByStatus', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/findByStatus' },
    },
    value: {
      tags: ['pet'],
      summary: 'Finds Pets by status',
      description:
        'Multiple status values can be provided with comma separated strings',
      operationId: 'findPetsByStatus',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'get',
      pathPattern: '/pet/findByStatus',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'parameters',
        'query',
        'status',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inRequest: { query: 'status' },
      },
    },
    value: {
      name: 'status',
      in: 'query',
      description: 'Status values that need to be considered for filter',
      required: true,
      style: 'form',
      explode: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          default: 'available',
          enum: ['available', 'pending', 'sold'],
        },
      },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: { contentType: 'application/xml', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/responses/200',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/responses/400',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid status value', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get',
      conceptualPath: ['operations', '/pet/findByTags', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/findByTags' },
    },
    value: {
      tags: ['pet'],
      summary: 'Finds Pets by tags',
      description:
        'Muliple tags can be provided with comma separated strings. Use         tag1, tag2, tag3 for testing.',
      operationId: 'findPetsByTags',
      deprecated: true,
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'get',
      pathPattern: '/pet/findByTags',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'parameters',
        'query',
        'tags',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inRequest: { query: 'tags' },
      },
    },
    value: {
      name: 'tags',
      in: 'query',
      description: 'Tags to filter by',
      required: true,
      style: 'form',
      explode: true,
      schema: { type: 'array', items: { type: 'string' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: { contentType: 'application/xml', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/responses/200',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/responses/400',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid tag value', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get',
      conceptualPath: ['operations', '/pet/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/{petId}' },
    },
    value: {
      tags: ['pet'],
      summary: 'Find pet by ID',
      description: 'Returns a single pet',
      operationId: 'getPetById',
      security: [{ api_key: [] }],
      method: 'get',
      pathPattern: '/pet/{petId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    value: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet to return',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category'],
      },
    },
    value: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['name'],
      },
    },
    value: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    value: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags'],
      },
    },
    value: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    value: { key: 'name', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/200',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/400',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/404',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post',
      conceptualPath: ['operations', '/pet/{}', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet/{petId}' },
    },
    value: {
      tags: ['pet'],
      summary: 'Updates a pet in the store with form data',
      operationId: 'updatePetWithForm',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'post',
      pathPattern: '/pet/{petId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    value: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet that needs to be updated',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
      },
    },
    value: { contentType: 'application/x-www-form-urlencoded', flatSchema: {} },
  },
  {
    value: {
      contentType: 'application/x-www-form-urlencoded',
      name: 'new name',
      status: 'available',
    },
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded/examples/available',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
        'examples',
        'available',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
        name: 'available',
      },
    },
  },
  {
    value: {
      contentType: 'application/x-www-form-urlencoded',
      name: 'good boy',
      status: 'sold',
    },
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded/examples/sold',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
        'examples',
        'sold',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
        name: 'sold',
      },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/requestBody',
      conceptualPath: ['operations', '/pet/{}', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {},
      },
    },
    value: {},
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/responses/405',
      conceptualPath: ['operations', '/pet/{}', 'post', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inResponse: { statusCode: '405' },
      },
    },
    value: { description: 'Invalid input', statusCode: '405' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete',
      conceptualPath: ['operations', '/pet/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/pet/{petId}' },
    },
    value: {
      tags: ['pet'],
      summary: 'Deletes a pet',
      operationId: 'deletePet',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'delete',
      pathPattern: '/pet/{petId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'delete',
        'parameters',
        'header',
        'api_key',
      ],
      kind: 'header-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inRequest: { header: 'api_key' },
      },
    },
    value: { name: 'api_key', in: 'header', schema: { type: 'string' } },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/parameters/1',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'delete',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    value: {
      name: 'petId',
      in: 'path',
      description: 'Pet id to delete',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/responses/400',
      conceptualPath: ['operations', '/pet/{}', 'delete', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/responses/404',
      conceptualPath: ['operations', '/pet/{}', 'delete', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post',
      conceptualPath: ['operations', '/pet/{}/uploadImage', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet/{petId}/uploadImage' },
    },
    value: {
      tags: ['pet'],
      summary: 'uploads an image',
      operationId: 'uploadFile',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'post',
      pathPattern: '/pet/{petId}/uploadImage',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: { path: 'petId' },
      },
    },
    value: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet to update',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/requestBody/content/multipart~1form-data',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'multipart/form-data',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: { body: { contentType: 'multipart/form-data' } },
      },
    },
    value: { contentType: 'multipart/form-data', flatSchema: {} },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/requestBody',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: {},
      },
    },
    value: {},
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/201',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '201' },
      },
    },
    value: { description: 'successful operation', statusCode: '201' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/404',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Pet not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'integer' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/default',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1inventory/get',
      conceptualPath: ['operations', '/store/inventory', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/store/inventory' },
    },
    value: {
      tags: ['store'],
      summary: 'Returns pet inventories by status',
      description: 'Returns a map of status codes to quantities',
      operationId: 'getInventory',
      security: [{ api_key: [] }],
      method: 'get',
      pathPattern: '/store/inventory',
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1inventory/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/inventory',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/inventory',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: {
        type: 'object',
        additionalProperties: { type: 'integer', format: 'int32' },
      },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1inventory/get/responses/200',
      conceptualPath: [
        'operations',
        '/store/inventory',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/inventory',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post',
      conceptualPath: ['operations', '/store/order', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/store/order' },
    },
    value: {
      tags: ['store'],
      summary: 'Place an order for a pet',
      operationId: 'placeOrder',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/store/order',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/store/order', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/petId',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'petId'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/quantity',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'quantity'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/shipDate',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'shipDate'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'status'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'delivered', 'canceled'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/summary',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'summary'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['summary'],
      },
    },
    value: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/complete',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'complete'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/requestBody',
      conceptualPath: ['operations', '/store/order', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: {},
      },
    },
    value: {
      description: 'order placed for purchasing the pet',
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'delivered', 'canceled'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    value: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'delivered', 'canceled'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    value: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    value: {
      contentType: 'application/json',
      value: {
        id: 458102,
        petId: 581231,
        quantity: 31,
        shipDate: '2022-03-04T22:54:32.631Z',
        status: 'delivered',
        summary: '31 boxes of dog food',
        complete: false,
      },
    },
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/example',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'example',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        singular: true,
      },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/responses/200',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order/post/responses/400',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid Order', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get',
      conceptualPath: ['operations', '/store/order/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/store/order/{orderId}' },
    },
    value: {
      tags: ['store'],
      summary: 'Find purchase order by ID',
      description:
        'For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions',
      operationId: 'getOrderById',
      method: 'get',
      pathPattern: '/store/order/{orderId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'parameters',
        'path',
        'orderId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inRequest: { path: 'orderId' },
      },
    },
    value: {
      name: 'orderId',
      in: 'path',
      description: 'ID of pet that needs to be fetched',
      required: true,
      schema: { maximum: 10, minimum: 1, type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'delivered', 'canceled'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    value: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Order' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    value: {
      key: 'petId',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/quantity',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'quantity',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['quantity'],
      },
    },
    value: {
      key: 'quantity',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/shipDate',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'shipDate',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['shipDate'],
      },
    },
    value: {
      key: 'shipDate',
      flatSchema: { type: 'string', format: 'date-time' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    value: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'Order Status',
        enum: ['placed', 'delivered', 'canceled'],
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    value: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/complete',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'complete',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['complete'],
      },
    },
    value: {
      key: 'complete',
      flatSchema: { type: 'boolean', default: false },
      required: false,
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/200',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/400',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/get/responses/404',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Order not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete',
      conceptualPath: ['operations', '/store/order/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/store/order/{orderId}' },
    },
    value: {
      tags: ['store'],
      summary: 'Delete purchase order by ID',
      description:
        'For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors',
      operationId: 'deleteOrder',
      method: 'delete',
      pathPattern: '/store/order/{orderId}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'parameters',
        'path',
        'orderId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inRequest: { path: 'orderId' },
      },
    },
    value: {
      name: 'orderId',
      in: 'path',
      description: 'ID of the order that needs to be deleted',
      required: true,
      schema: { minimum: 1, type: 'integer', format: 'int64' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/responses/400',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid ID supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1store~1order~1{orderId}/delete/responses/404',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'Order not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post',
      conceptualPath: ['operations', '/user', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user' },
    },
    value: {
      tags: ['user'],
      summary: 'Create user',
      description: 'This can only be done by the logged in user.',
      operationId: 'createUser',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/firstName',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'firstName'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/email',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'email'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/password',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'password'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/bio',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'bio'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/requestBody',
      conceptualPath: ['operations', '/user', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: { method: 'post', path: '/user', inRequest: {} },
    },
    value: { description: 'Created user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user/post/responses/default',
      conceptualPath: ['operations', '/user', 'post', 'responses', 'default'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post',
      conceptualPath: ['operations', '/user/createWithArray', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user/createWithArray' },
    },
    value: {
      tags: ['user'],
      summary: 'Creates list of users with given input array',
      operationId: 'createUsersWithArrayInput',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user/createWithArray',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/createWithArray', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: { contentType: '*/*', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/email',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/password',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/bio',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/requestBody',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: {},
      },
    },
    value: { description: 'List of user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithArray/post/responses/default',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post',
      conceptualPath: ['operations', '/user/createWithList', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/user/createWithList' },
    },
    value: {
      tags: ['user'],
      summary: 'Creates list of users with given input array',
      operationId: 'createUsersWithListInput',
      'x-codegen-request-body-name': 'body',
      method: 'post',
      pathPattern: '/user/createWithList',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/createWithList', 'post', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: { contentType: '*/*', flatSchema: { type: 'array' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/email',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/password',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/bio',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/requestBody',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        'requestBody',
      ],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: {},
      },
    },
    value: { description: 'List of user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1createWithList/post/responses/default',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get',
      conceptualPath: ['operations', '/user/login', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/login' },
    },
    value: {
      tags: ['user'],
      summary: 'Logs user into the system',
      operationId: 'loginUser',
      method: 'get',
      pathPattern: '/user/login',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/parameters/0',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'parameters',
        'query',
        'username',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inRequest: { query: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'query',
      description: 'The user name for login',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/parameters/1',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'parameters',
        'query',
        'password',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inRequest: { query: 'password' },
      },
    },
    value: {
      name: 'password',
      in: 'query',
      description: 'The password for login in clear text',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'X-Rate-Limit',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'X-Rate-Limit' },
      },
    },
    value: {
      name: 'X-Rate-Limit',
      description: 'calls per hour allowed by the user',
      schema: { type: 'integer', format: 'int32' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/headers/X-Expires-After',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'X-Expires-After',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'X-Expires-After' },
      },
    },
    value: {
      name: 'X-Expires-After',
      description: 'date in UTC when token expires',
      schema: { type: 'string', format: 'date-time' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: { contentType: 'application/xml', flatSchema: { type: 'string' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'string' } },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200',
      conceptualPath: ['operations', '/user/login', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/400',
      conceptualPath: ['operations', '/user/login', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '400' },
      },
    },
    value: {
      description: 'Invalid username/password supplied',
      statusCode: '400',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1logout/get',
      conceptualPath: ['operations', '/user/logout', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/logout' },
    },
    value: {
      tags: ['user'],
      summary: 'Logs out current logged in user session',
      operationId: 'logoutUser',
      method: 'get',
      pathPattern: '/user/logout',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1logout/get/responses/default',
      conceptualPath: [
        'operations',
        '/user/logout',
        'get',
        'responses',
        'default',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/logout',
        inResponse: { statusCode: 'default' },
      },
    },
    value: { description: 'successful operation', statusCode: 'default' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get',
      conceptualPath: ['operations', '/user/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Get user by user name',
      operationId: 'getUserByName',
      method: 'get',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'The name that needs to be fetched. Use user1 for testing. ',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    value: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/email',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/password',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/bio',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/firstName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'firstName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/email',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'email',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/password',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'password',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/bio',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/200',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '200' },
      },
    },
    value: { description: 'successful operation', statusCode: '200' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/400',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid username supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    value: { contentType: 'application/json', flatSchema: { type: 'object' } },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    value: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    value: { key: 'type', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    value: { key: 'message', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/get/responses/404',
      conceptualPath: ['operations', '/user/{}', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put',
      conceptualPath: ['operations', '/user/{}', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Updated user',
      description: 'This can only be done by the logged in user.',
      operationId: 'updateUser',
      'x-codegen-request-body-name': 'body',
      method: 'put',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'put',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'name that need to be updated',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/requestBody/content/*~1*',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
      },
    },
    value: {
      contentType: '*/*',
      flatSchema: { type: 'object', xml: { name: 'User' } },
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/id',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['id'],
      },
    },
    value: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    value: { key: 'username', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/firstName',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'firstName'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['firstName'],
      },
    },
    value: {
      key: 'firstName',
      flatSchema: { type: 'string' },
      required: false,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    value: { key: 'lastName', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/email',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'email'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['email'],
      },
    },
    value: { key: 'email', flatSchema: { type: 'string' }, required: true },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/password',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'password'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['password'],
      },
    },
    value: { key: 'password', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    value: {
      key: 'userStatus',
      flatSchema: {
        type: 'string',
        description: 'User Status',
        enum: ['activation-pending', 'activated', 'blocked'],
      },
      required: true,
    },
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/bio',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'bio'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['bio'],
      },
    },
    value: { key: 'bio', flatSchema: { type: 'string' }, required: false },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/requestBody',
      conceptualPath: ['operations', '/user/{}', 'put', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: {},
      },
    },
    value: { description: 'Updated user object', required: true },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/responses/400',
      conceptualPath: ['operations', '/user/{}', 'put', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid user supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/put/responses/404',
      conceptualPath: ['operations', '/user/{}', 'put', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete',
      conceptualPath: ['operations', '/user/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/user/{username}' },
    },
    value: {
      tags: ['user'],
      summary: 'Delete user',
      description: 'This can only be done by the logged in user.',
      operationId: 'deleteUser',
      method: 'delete',
      pathPattern: '/user/{username}',
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/user/{}',
        'delete',
        'parameters',
        'path',
        'username',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inRequest: { path: 'username' },
      },
    },
    value: {
      name: 'username',
      in: 'path',
      description: 'The name that needs to be deleted',
      required: true,
      schema: { type: 'string' },
    },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/responses/400',
      conceptualPath: ['operations', '/user/{}', 'delete', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inResponse: { statusCode: '400' },
      },
    },
    value: { description: 'Invalid username supplied', statusCode: '400' },
  },
  {
    location: {
      jsonPath: '/paths/~1user~1{username}/delete/responses/404',
      conceptualPath: ['operations', '/user/{}', 'delete', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/user/{username}',
        inResponse: { statusCode: '404' },
      },
    },
    value: { description: 'User not found', statusCode: '404' },
  },
] as IFact[];
export const changes = [
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/1/properties/order',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '1',
        'order',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'order'],
      },
    },
    added: { key: 'order', flatSchema: { type: 'object' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject/anyOf/1/properties/order/properties/id',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
        'anyOf',
        '1',
        'order',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject', 'order', 'id'],
      },
    },
    added: { key: 'id', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/number',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/json',
        'number',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['number'],
      },
    },
    added: { key: 'number', flatSchema: { type: 'string' }, required: true },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get',
      conceptualPath: ['operations', '/pet/findByStatus', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/findByStatus' },
    },
    added: {
      tags: ['pet'],
      summary: 'Finds Pets by status',
      description:
        'Multiple status values can be provided with comma separated strings',
      operationId: 'findPetsByStatus',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'get',
      pathPattern: '/pet/findByStatus',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'parameters',
        'query',
        'status',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inRequest: { query: 'status' },
      },
    },
    added: {
      name: 'status',
      in: 'query',
      description: 'Status values that need to be considered for filter',
      required: true,
      style: 'form',
      explode: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          default: 'available',
          enum: ['available', 'pending', 'sold'],
        },
      },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    added: { contentType: 'application/xml', flatSchema: { type: 'array' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1xml/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'array' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByStatus/get/responses/200/content/application~1json/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/responses/200',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: { statusCode: '200' },
      },
    },
    added: { description: 'successful operation', statusCode: '200' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByStatus/get/responses/400',
      conceptualPath: [
        'operations',
        '/pet/findByStatus',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByStatus',
        inResponse: { statusCode: '400' },
      },
    },
    added: { description: 'Invalid status value', statusCode: '400' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get',
      conceptualPath: ['operations', '/pet/findByTags', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/findByTags' },
    },
    added: {
      tags: ['pet'],
      summary: 'Finds Pets by tags',
      description:
        'Muliple tags can be provided with comma separated strings. Use         tag1, tag2, tag3 for testing.',
      operationId: 'findPetsByTags',
      deprecated: true,
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'get',
      pathPattern: '/pet/findByTags',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'parameters',
        'query',
        'tags',
      ],
      kind: 'query-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inRequest: { query: 'tags' },
      },
    },
    added: {
      name: 'tags',
      in: 'query',
      description: 'Tags to filter by',
      required: true,
      style: 'form',
      explode: true,
      schema: { type: 'array', items: { type: 'string' } },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    added: { contentType: 'application/xml', flatSchema: { type: 'array' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1xml/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/xml',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'array' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1findByTags/get/responses/200/content/application~1json/schema/items/properties/status',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
        'application/json',
        'items',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['items', 'status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/responses/200',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: { statusCode: '200' },
      },
    },
    added: { description: 'successful operation', statusCode: '200' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1findByTags/get/responses/400',
      conceptualPath: [
        'operations',
        '/pet/findByTags',
        'get',
        'responses',
        '400',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/findByTags',
        inResponse: { statusCode: '400' },
      },
    },
    added: { description: 'Invalid tag value', statusCode: '400' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get',
      conceptualPath: ['operations', '/pet/{}', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet/{petId}' },
    },
    added: {
      tags: ['pet'],
      summary: 'Find pet by ID',
      description: 'Returns a single pet',
      operationId: 'getPetById',
      security: [{ api_key: [] }],
      method: 'get',
      pathPattern: '/pet/{petId}',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    added: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet to return',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
      },
    },
    added: {
      contentType: 'application/xml',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: {
      contentType: 'application/json',
      flatSchema: { type: 'object', xml: { name: 'Pet' } },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category'],
      },
    },
    added: {
      key: 'category',
      flatSchema: { type: 'object', xml: { name: 'Category' } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['name'],
      },
    },
    added: {
      key: 'name',
      flatSchema: { type: 'string', example: 'doggie' },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    added: {
      key: 'photoUrls',
      flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
      required: true,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags'],
      },
    },
    added: {
      key: 'tags',
      flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    added: {
      key: 'id',
      flatSchema: { type: 'integer', format: 'int64' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    added: { key: 'name', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/get/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    added: {
      key: 'status',
      flatSchema: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/200',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '200'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '200' },
      },
    },
    added: { description: 'successful operation', statusCode: '200' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/400',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '400' },
      },
    },
    added: { description: 'Invalid ID supplied', statusCode: '400' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/get/responses/404',
      conceptualPath: ['operations', '/pet/{}', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet/{petId}',
        inResponse: { statusCode: '404' },
      },
    },
    added: { description: 'Pet not found', statusCode: '404' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post',
      conceptualPath: ['operations', '/pet/{}', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet/{petId}' },
    },
    added: {
      tags: ['pet'],
      summary: 'Updates a pet in the store with form data',
      operationId: 'updatePetWithForm',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'post',
      pathPattern: '/pet/{petId}',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    added: {
      name: 'petId',
      in: 'path',
      description: 'ID of pet that needs to be updated',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
      },
    },
    added: { contentType: 'application/x-www-form-urlencoded', flatSchema: {} },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded/examples/available',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
        'examples',
        'available',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
        name: 'available',
      },
    },
    added: {
      contentType: 'application/x-www-form-urlencoded',
      name: 'new name',
      status: 'available',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}/post/requestBody/content/application~1x-www-form-urlencoded/examples/sold',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'post',
        'application/x-www-form-urlencoded',
        'examples',
        'sold',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {
          body: { contentType: 'application/x-www-form-urlencoded' },
        },
        name: 'sold',
      },
    },
    added: {
      contentType: 'application/x-www-form-urlencoded',
      name: 'good boy',
      status: 'sold',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/requestBody',
      conceptualPath: ['operations', '/pet/{}', 'post', 'requestBody'],
      kind: 'request',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inRequest: {},
      },
    },
    added: {},
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/post/responses/405',
      conceptualPath: ['operations', '/pet/{}', 'post', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}',
        inResponse: { statusCode: '405' },
      },
    },
    added: { description: 'Invalid input', statusCode: '405' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete',
      conceptualPath: ['operations', '/pet/{}', 'delete'],
      kind: 'operation',
      conceptualLocation: { method: 'delete', path: '/pet/{petId}' },
    },
    added: {
      tags: ['pet'],
      summary: 'Deletes a pet',
      operationId: 'deletePet',
      security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
      method: 'delete',
      pathPattern: '/pet/{petId}',
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/parameters/0',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'delete',
        'parameters',
        'header',
        'api_key',
      ],
      kind: 'header-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inRequest: { header: 'api_key' },
      },
    },
    added: { name: 'api_key', in: 'header', schema: { type: 'string' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/parameters/1',
      conceptualPath: [
        'operations',
        '/pet/{}',
        'delete',
        'parameters',
        'path',
        'petId',
      ],
      kind: 'path-parameter',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inRequest: { path: 'petId' },
      },
    },
    added: {
      name: 'petId',
      in: 'path',
      description: 'Pet id to delete',
      required: true,
      schema: { type: 'integer', format: 'int64' },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/responses/400',
      conceptualPath: ['operations', '/pet/{}', 'delete', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inResponse: { statusCode: '400' },
      },
    },
    added: { description: 'Invalid ID supplied', statusCode: '400' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}/delete/responses/404',
      conceptualPath: ['operations', '/pet/{}', 'delete', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'delete',
        path: '/pet/{petId}',
        inResponse: { statusCode: '404' },
      },
    },
    added: { description: 'Pet not found', statusCode: '404' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'object' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    added: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    added: { key: 'type', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/201/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '201',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    added: { key: 'message', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/201',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '201',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '201' },
      },
    },
    added: { description: 'successful operation', statusCode: '201' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'object' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    added: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    added: { key: 'type', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    added: { key: 'message', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/404',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '404',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '404' },
      },
    },
    added: { description: 'Pet not found', statusCode: '404' },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/summary',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'summary'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['summary'],
      },
    },
    added: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    added: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    added: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/example',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'example',
      ],
      kind: 'body-example',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        singular: true,
      },
    },
    added: {
      contentType: 'application/json',
      value: {
        id: 458102,
        petId: 581231,
        quantity: 31,
        shipDate: '2022-03-04T22:54:32.631Z',
        status: 'delivered',
        summary: '31 boxes of dog food',
        complete: false,
      },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    added: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/summary',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'summary',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['summary'],
      },
    },
    added: {
      key: 'summary',
      flatSchema: {
        type: 'string',
        description: 'Human readable summary of order',
      },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'object' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    added: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    added: { key: 'type', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    added: { key: 'message', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'object' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    added: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    added: { key: 'type', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/delete/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'delete',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'delete',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    added: { key: 'message', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/bio',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'bio'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/bio',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/bio',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'X-Rate-Limit',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'X-Rate-Limit' },
      },
    },
    added: {
      name: 'X-Rate-Limit',
      description: 'calls per hour allowed by the user',
      schema: { type: 'integer', format: 'int32' },
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/bio',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/bio',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'bio',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
      },
    },
    added: { contentType: 'application/json', flatSchema: { type: 'object' } },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    added: {
      key: 'code',
      flatSchema: { type: 'integer', format: 'int32' },
      required: false,
    },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    added: { key: 'type', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/404/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '404',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '404',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    added: { key: 'message', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/bio',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'bio'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['bio'],
      },
    },
    added: { key: 'bio', flatSchema: { type: 'string' }, required: false },
    changeType: 'added',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/stringOrNumberOrObject/oneOf/2/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'stringOrNumberOrObject',
        'oneOf',
        '2',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['stringOrNumberOrObject', 'orderId'],
      },
    },
    removed: {
      before: {
        key: 'orderId',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get',
      conceptualPath: ['operations', '/pet', 'get'],
      kind: 'operation',
      conceptualLocation: { method: 'get', path: '/pet' },
    },
    removed: { before: { method: 'get', pathPattern: '/pet' } },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get/responses/404',
      conceptualPath: ['operations', '/pet', 'get', 'responses', '404'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet',
        inResponse: { statusCode: '404' },
      },
    },
    removed: { before: { description: 'Pet not found', statusCode: '404' } },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/get/responses/405',
      conceptualPath: ['operations', '/pet', 'get', 'responses', '405'],
      kind: 'response',
      conceptualLocation: {
        method: 'get',
        path: '/pet',
        inResponse: { statusCode: '405' },
      },
    },
    removed: {
      before: { description: 'Validation exception', statusCode: '405' },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1json/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'put', 'application/json', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/json' } },
        jsonSchemaTrail: ['name'],
      },
    },
    removed: {
      before: {
        key: 'name',
        flatSchema: { type: 'string', example: 'doggie' },
        required: true,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/requestBody/content/application~1xml',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml'],
      kind: 'body',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
      },
    },
    removed: {
      before: {
        contentType: 'application/xml',
        flatSchema: { type: 'object', xml: { name: 'Pet' } },
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/id',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'id'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['id'],
      },
    },
    removed: {
      before: {
        key: 'id',
        flatSchema: { type: 'integer', format: 'int64' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category'],
      },
    },
    removed: {
      before: {
        key: 'category',
        flatSchema: { type: 'object', xml: { name: 'Category' } },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'id'],
      },
    },
    removed: {
      before: {
        key: 'id',
        flatSchema: { type: 'integer', format: 'int64' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/category/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'category',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['category', 'name'],
      },
    },
    removed: {
      before: { key: 'name', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/name',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'name'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['name'],
      },
    },
    removed: {
      before: {
        key: 'name',
        flatSchema: { type: 'string', example: 'doggie' },
        required: true,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/photoUrls',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'photoUrls',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['photoUrls'],
      },
    },
    removed: {
      before: {
        key: 'photoUrls',
        flatSchema: { type: 'array', xml: { name: 'photoUrl', wrapped: true } },
        required: true,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags',
      conceptualPath: ['operations', '/pet', 'put', 'application/xml', 'tags'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags'],
      },
    },
    removed: {
      before: {
        key: 'tags',
        flatSchema: { type: 'array', xml: { name: 'tag', wrapped: true } },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags/items/properties/id',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'tags',
        'items',
        'id',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'id'],
      },
    },
    removed: {
      before: {
        key: 'id',
        flatSchema: { type: 'integer', format: 'int64' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/tags/items/properties/name',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'tags',
        'items',
        'name',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['tags', 'items', 'name'],
      },
    },
    removed: {
      before: { key: 'name', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet/put/requestBody/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/pet',
        'put',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inRequest: { body: { contentType: 'application/xml' } },
        jsonSchemaTrail: ['status'],
      },
    },
    removed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'pet status in the store',
          enum: ['available', 'pending', 'sold'],
        },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/put/responses/400',
      conceptualPath: ['operations', '/pet', 'put', 'responses', '400'],
      kind: 'response',
      conceptualLocation: {
        method: 'put',
        path: '/pet',
        inResponse: { statusCode: '400' },
      },
    },
    removed: {
      before: { description: 'Invalid ID supplied', statusCode: '400' },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
      ],
      kind: 'body',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
      },
    },
    removed: {
      before: {
        contentType: 'application/json',
        flatSchema: { type: 'object' },
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/code',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'code',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['code'],
      },
    },
    removed: {
      before: {
        key: 'code',
        flatSchema: { type: 'integer', format: 'int32' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    removed: {
      before: { key: 'type', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/200/content/application~1json/schema/properties/message',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
        'application/json',
        'message',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['message'],
      },
    },
    removed: {
      before: {
        key: 'message',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/responses/200',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        '200',
      ],
      kind: 'response',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: { statusCode: '200' },
      },
    },
    removed: {
      before: { description: 'successful operation', statusCode: '200' },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/phone',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'phone'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/phone',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/phone',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '/paths/~1user~1login/get/responses/200/headers/content-type',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'content-type',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'content-type' },
      },
    },
    removed: {
      before: {
        name: 'content-type',
        description: 'the description goes here',
        schema: { type: 'string' },
      },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/phone',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/phone',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'phone',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/phone',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'phone'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['phone'],
      },
    },
    removed: {
      before: { key: 'phone', flatSchema: { type: 'string' }, required: false },
    },
    changeType: 'removed',
  },
  {
    location: {
      jsonPath: '',
      conceptualPath: [],
      conceptualLocation: {},
      kind: 'specification',
    },
    changed: {
      before: {
        openapi: '3.0.1',
        info: {
          title: 'Swagger Petstore',
          description:
            'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
          termsOfService: 'http://swagger.io/terms/',
          contact: { email: 'apiteam@swagger.io' },
          license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
          },
          version: '1.0.0',
        },
        externalDocs: {
          description: 'Find out more about Swagger',
          url: 'http://swagger.io',
        },
        servers: [
          { url: 'https://petstore.swagger.io/v2' },
          { url: 'http://petstore.swagger.io/v2' },
        ],
        tags: [
          {
            name: 'pet',
            description: 'Everything about your Pets',
            externalDocs: {
              description: 'Find out more',
              url: 'http://swagger.io',
            },
          },
          { name: 'store', description: 'Access to Petstore orders' },
          {
            name: 'user',
            description: 'Operations about user',
            externalDocs: {
              description: 'Find out more about our store',
              url: 'http://swagger.io',
            },
          },
        ],
      },
      after: {
        openapi: '3.0.1',
        info: {
          title: 'Swagger Petstore Updated',
          description:
            'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
          termsOfService: 'http://swagger.io/terms/',
          contact: { email: 'apiteam@swagger.io' },
          license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
          },
          version: '1.0.0',
        },
        externalDocs: {
          description: 'Find out more about Swagger',
          url: 'http://swagger.io',
        },
        servers: [
          { url: 'https://petstore.swagger.io/v2' },
          { url: 'http://petstore.swagger.io/v2' },
          { url: 'http://petstore.swagger.io/v3' },
        ],
        tags: [
          {
            name: 'pet',
            description: 'Everything about your Pets',
            externalDocs: {
              description: 'Find out more',
              url: 'http://swagger.io',
            },
          },
          { name: 'store', description: 'Access to Petstore orders' },
          {
            name: 'user',
            description: 'Operations about user',
            externalDocs: {
              description: 'Find out more about our store',
              url: 'http://swagger.io',
            },
          },
        ],
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/stringOrNumberOrObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'stringOrNumberOrObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['stringOrNumberOrObject'],
      },
    },
    changed: {
      before: {
        key: 'stringOrNumberOrObject',
        flatSchema: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'object', properties: { orderId: { type: 'string' } } },
          ],
        },
        required: false,
      },
      after: {
        key: 'stringOrNumberOrObject',
        flatSchema: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject'],
      },
    },
    changed: {
      before: {
        key: 'composedObject',
        flatSchema: {
          allOf: [
            { type: 'object', properties: { orderId: { type: 'string' } } },
            {
              type: 'object',
              properties: { fulfillmentId: { type: 'string' } },
            },
          ],
        },
        required: false,
      },
      after: {
        key: 'composedObject',
        flatSchema: {
          allOf: [
            { type: 'object', properties: { orderId: { type: 'number' } } },
            {
              type: 'object',
              properties: { fulfillmentId: { type: 'string' } },
            },
          ],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/composedObject/allOf/0/properties/orderId',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'composedObject',
        'allOf',
        '0',
        'orderId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['composedObject', 'orderId'],
      },
    },
    changed: {
      before: {
        key: 'orderId',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'orderId',
        flatSchema: { type: 'number' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1example/get/responses/200/content/application~1json/schema/properties/expandableObject',
      conceptualPath: [
        'operations',
        '/example',
        'get',
        'responses',
        '200',
        'application/json',
        'expandableObject',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/example',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['expandableObject'],
      },
    },
    changed: {
      before: {
        key: 'expandableObject',
        flatSchema: {
          anyOf: [
            { type: 'object', properties: { orderId: { type: 'string' } } },
          ],
        },
        required: false,
      },
      after: {
        key: 'expandableObject',
        flatSchema: {
          anyOf: [
            { type: 'object', properties: { orderId: { type: 'string' } } },
            {
              type: 'object',
              properties: {
                order: {
                  type: 'object',
                  properties: { id: { type: 'string' } },
                },
              },
            },
          ],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath: '/paths/~1pet/post',
      conceptualPath: ['operations', '/pet', 'post'],
      kind: 'operation',
      conceptualLocation: { method: 'post', path: '/pet' },
    },
    changed: {
      before: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        operationId: 'addPet',
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
        'x-codegen-request-body-name': 'body',
        method: 'post',
        pathPattern: '/pet',
      },
      after: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        operationId: 'addPet-change',
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
        'x-codegen-request-body-name': 'body',
        method: 'post',
        pathPattern: '/pet',
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1pet~1{petId}~1uploadImage/post/responses/default/content/application~1json/schema/properties/type',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'responses',
        'default',
        'application/json',
        'type',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inResponse: {
          statusCode: 'default',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['type'],
      },
    },
    changed: {
      before: { key: 'type', flatSchema: { type: 'string' }, required: false },
      after: { key: 'type', flatSchema: { type: 'integer' }, required: false },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/requestBody/content/*~1*/schema/properties/status',
      conceptualPath: ['operations', '/store/order', 'post', '*/*', 'status'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['status'],
      },
    },
    changed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'approved', 'delivered'],
        },
        required: false,
      },
      after: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'delivered', 'canceled'],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    changed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'approved', 'delivered'],
        },
        required: false,
      },
      after: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'delivered', 'canceled'],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order/post/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order',
        'post',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/store/order',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    changed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'approved', 'delivered'],
        },
        required: false,
      },
      after: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'delivered', 'canceled'],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/petId',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'petId',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['petId'],
      },
    },
    changed: {
      before: {
        key: 'petId',
        flatSchema: { type: 'integer', format: 'int64' },
        required: true,
      },
      after: {
        key: 'petId',
        flatSchema: { type: 'integer', format: 'int64' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1xml/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    changed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'approved', 'delivered'],
        },
        required: false,
      },
      after: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'delivered', 'canceled'],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1store~1order~1{orderId}/get/responses/200/content/application~1json/schema/properties/status',
      conceptualPath: [
        'operations',
        '/store/order/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'status',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/store/order/{orderId}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['status'],
      },
    },
    changed: {
      before: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'approved', 'delivered'],
        },
        required: false,
      },
      after: {
        key: 'status',
        flatSchema: {
          type: 'string',
          description: 'Order Status',
          enum: ['placed', 'delivered', 'canceled'],
        },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user/post/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user', 'post', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithArray/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithArray',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithArray',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/username',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1createWithList/post/requestBody/content/*~1*/schema/items/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/createWithList',
        'post',
        '*/*',
        'items',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'post',
        path: '/user/createWithList',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['items', 'userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1login/get/responses/200/headers/X-Expires-After',
      conceptualPath: [
        'operations',
        '/user/login',
        'get',
        'responses',
        '200',
        'headers',
        'X-Expires-After',
      ],
      kind: 'response-header',
      conceptualLocation: {
        method: 'get',
        path: '/user/login',
        inResponse: { statusCode: '200', header: 'X-Expires-After' },
      },
    },
    changed: {
      before: {
        name: 'X-Expires-After',
        description: 'date in UTC when token expires',
        schema: { type: 'number' },
      },
      after: {
        name: 'X-Expires-After',
        description: 'date in UTC when token expires',
        schema: { type: 'string', format: 'date-time' },
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1xml/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/xml',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/xml' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/username',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'username',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/lastName',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'lastName',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/get/responses/200/content/application~1json/schema/properties/userStatus',
      conceptualPath: [
        'operations',
        '/user/{}',
        'get',
        'responses',
        '200',
        'application/json',
        'userStatus',
      ],
      kind: 'field',
      conceptualLocation: {
        method: 'get',
        path: '/user/{username}',
        inResponse: {
          statusCode: '200',
          body: { contentType: 'application/json' },
        },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/username',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'username'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['username'],
      },
    },
    changed: {
      before: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: false,
      },
      after: {
        key: 'username',
        flatSchema: { type: 'string' },
        required: true,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/lastName',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'lastName'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['lastName'],
      },
    },
    changed: {
      before: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: true,
      },
      after: {
        key: 'lastName',
        flatSchema: { type: 'string' },
        required: false,
      },
    },
    changeType: 'changed',
  },
  {
    location: {
      jsonPath:
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/userStatus',
      conceptualPath: ['operations', '/user/{}', 'put', '*/*', 'userStatus'],
      kind: 'field',
      conceptualLocation: {
        method: 'put',
        path: '/user/{username}',
        inRequest: { body: { contentType: '*/*' } },
        jsonSchemaTrail: ['userStatus'],
      },
    },
    changed: {
      before: {
        key: 'userStatus',
        flatSchema: {
          type: 'integer',
          description: 'User Status',
          format: 'int32',
        },
        required: true,
      },
      after: {
        key: 'userStatus',
        flatSchema: {
          type: 'string',
          description: 'User Status',
          enum: ['activation-pending', 'activated', 'blocked'],
        },
        required: true,
      },
    },
    changeType: 'changed',
  },
] as IChange[];
