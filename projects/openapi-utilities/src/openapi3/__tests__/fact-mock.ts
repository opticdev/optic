import { IFact } from '../sdk/types';

export const FactsMock = [
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
      jsonPath: '/paths/~1pet~1{petId}~1uploadImage/post/parameters/1',
      conceptualPath: [
        'operations',
        '/pet/{}/uploadImage',
        'post',
        'parameters',
        'cookie',
        'debug',
      ],
      kind: 'cookie-parameter',
      conceptualLocation: {
        method: 'post',
        path: '/pet/{petId}/uploadImage',
        inRequest: { cookie: 'debug' },
      },
    },
    value: {
      name: 'debug',
      in: 'cookie',
      description: 'A debug token',
      schema: { type: 'integer' },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
      required: false,
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
    value: { key: 'email', flatSchema: { type: 'string' }, required: false },
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
      required: false,
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
