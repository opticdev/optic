import { OpenAPIV3, IFact, IChange } from '@useoptic/openapi-utilities';

export const beforeOpenApiJson: OpenAPIV3.Document = {
  openapi: '3.0.1',
  info: {
    title: 'Swagger Petstore',
    description:
      'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
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
    {
      url: 'https://petstore.swagger.io/v2',
    },
    {
      url: 'http://petstore.swagger.io/v2',
    },
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
    {
      name: 'store',
      description: 'Access to Petstore orders',
    },
    {
      name: 'user',
      description: 'Operations about user',
      externalDocs: {
        description: 'Find out more about our store',
        url: 'http://swagger.io',
      },
    },
  ],
  paths: {
    '/example': {
      get: {
        operationId: 'getExamples',
        responses: {
          '200': {
            description: 'succesful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stringOrNumberOrObject: {
                      oneOf: [
                        { type: 'string' },
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            orderId: { type: 'string' },
                          },
                        },
                      ],
                    },
                    composedObject: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            orderId: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            fulfillmentId: { type: 'string' },
                          },
                        },
                      ],
                    },
                    expandableObject: {
                      anyOf: [
                        {
                          type: 'object',
                          properties: {
                            orderId: { type: 'string' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/pet': {
      put: {
        operationId: 'putpet',
        requestBody: {
          description: 'Pet object that needs to be added to the store',
          content: {
            'application/json': {
              schema: {
                required: ['name', 'photoUrls'],
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      name: {
                        type: 'string',
                      },
                    },
                    xml: {
                      name: 'Category',
                    },
                  },
                  name: {
                    type: 'string',
                    example: 'doggie',
                  },
                  photoUrls: {
                    type: 'array',
                    xml: {
                      name: 'photoUrl',
                      wrapped: true,
                    },
                    items: {
                      type: 'string',
                    },
                  },
                  tags: {
                    type: 'array',
                    xml: {
                      name: 'tag',
                      wrapped: true,
                    },
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          format: 'int64',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                      xml: {
                        name: 'Tag',
                      },
                    },
                  },
                  status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                  },
                },
                xml: {
                  name: 'Pet',
                },
              },
            },
            'application/xml': {
              schema: {
                required: ['name', 'photoUrls'],
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      name: {
                        type: 'string',
                      },
                    },
                    xml: {
                      name: 'Category',
                    },
                  },
                  name: {
                    type: 'string',
                    example: 'doggie',
                  },
                  photoUrls: {
                    type: 'array',
                    xml: {
                      name: 'photoUrl',
                      wrapped: true,
                    },
                    items: {
                      type: 'string',
                    },
                  },
                  tags: {
                    type: 'array',
                    xml: {
                      name: 'tag',
                      wrapped: true,
                    },
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          format: 'int64',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                      xml: {
                        name: 'Tag',
                      },
                    },
                  },
                  status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                  },
                },
                xml: {
                  name: 'Pet',
                },
              },
            },
          },
        },
        responses: {
          '400': {
            description: 'Invalid ID supplied',
            content: {},
          },
          '404': {
            description: 'Pet not found',
            content: {},
          },
          '405': {
            description: 'Validation exception',
            content: {},
          },
        },
      },
    },
    '/store/order/{orderId}': {
      get: {
        tags: ['store'],
        summary: 'Find purchase order by ID',
        description:
          'For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions',
        operationId: 'getOrderById',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            description: 'ID of pet that needs to be fetched',
            required: true,
            schema: {
              maximum: 10,
              minimum: 1,
              type: 'integer',
              format: 'int64',
            },
          },
        ],
        responses: {
          '200': {
            description: 'successful operation',
            content: {
              'application/xml': {
                schema: {
                  type: 'object',
                  required: ['id', 'petId'],
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    petId: {
                      type: 'integer',
                      format: 'int64',
                    },
                    quantity: {
                      type: 'integer',
                      format: 'int32',
                    },
                    shipDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    status: {
                      type: 'string',
                      description: 'Order Status',
                      enum: ['placed', 'approved', 'delivered'],
                    },
                    complete: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  xml: {
                    name: 'Order',
                  },
                },
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    petId: {
                      type: 'integer',
                      format: 'int64',
                    },
                    quantity: {
                      type: 'integer',
                      format: 'int32',
                    },
                    shipDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    status: {
                      type: 'string',
                      description: 'Order Status',
                      enum: ['placed', 'approved', 'delivered'],
                    },
                    complete: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  xml: {
                    name: 'Order',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid ID supplied',
            content: {},
          },
          '404': {
            description: 'Order not found',
            content: {},
          },
        },
      },
      delete: {
        tags: ['store'],
        summary: 'Delete purchase order by ID',
        description:
          'For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors',
        operationId: 'deleteOrder',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            description: 'ID of the order that needs to be deleted',
            required: true,
            schema: {
              minimum: 1,
              type: 'integer',
              format: 'int64',
            },
          },
        ],
        responses: {
          '400': {
            description: 'Invalid ID supplied',
            content: {},
          },
          '404': {
            description: 'Order not found',
            content: {},
          },
        },
      },
    },
    '/user/createWithArray': {
      post: {
        tags: ['user'],
        summary: 'Creates list of users with given input array',
        operationId: 'createUsersWithArrayInput',
        requestBody: {
          description: 'List of user object',
          content: {
            '*/*': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'email', 'lastName', 'userStatus'],
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    username: {
                      type: 'string',
                    },
                    firstName: {
                      type: 'string',
                    },
                    lastName: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    password: {
                      type: 'string',
                    },
                    phone: {
                      type: 'string',
                    },
                    userStatus: {
                      type: 'integer',
                      description: 'User Status',
                      format: 'int32',
                    },
                  },
                  xml: {
                    name: 'User',
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          default: {
            description: 'successful operation',
            content: {},
          },
        },
        'x-codegen-request-body-name': 'body',
      },
    },
  },
} as OpenAPIV3.Document;

export const afterOpenApiJson: OpenAPIV3.Document = {
  openapi: '3.0.1',
  info: {
    title: 'Swagger Petstore Updated',
    description:
      'This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.',
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
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
  security: [
    {
      AuthScope: ['admin'],
    },
  ],
  servers: [
    {
      url: 'https://petstore.swagger.io/v2',
    },
    {
      url: 'http://petstore.swagger.io/v2',
    },
    {
      url: 'http://petstore.swagger.io/v3',
    },
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
    {
      name: 'store',
      description: 'Access to Petstore orders',
    },
    {
      name: 'user',
      description: 'Operations about user',
      externalDocs: {
        description: 'Find out more about our store',
        url: 'http://swagger.io',
      },
    },
  ],
  paths: {
    '/example': {
      get: {
        operationId: 'getExamples',
        security: [
          {
            LocalAuthScope: ['admin'],
          },
        ],
        responses: {
          '200': {
            description: 'succesful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stringOrNumberOrObject: {
                      oneOf: [{ type: 'string' }, { type: 'number' }],
                    },
                    composedObject: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            orderId: { type: 'number' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            fulfillmentId: { type: 'string' },
                          },
                        },
                      ],
                    },
                    expandableObject: {
                      anyOf: [
                        {
                          type: 'object',
                          properties: {
                            orderId: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            order: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/pet': {
      put: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        operationId: 'putpet-change',
        requestBody: {
          description: 'Pet object that needs to be added to the store',
          content: {
            'application/json': {
              schema: {
                required: ['number', 'photoUrls'],
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                  number: {
                    type: 'string',
                  },
                  category: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      name: {
                        type: 'string',
                      },
                    },
                    xml: {
                      name: 'Category',
                    },
                  },
                  photoUrls: {
                    type: 'array',
                    xml: {
                      name: 'photoUrl',
                      wrapped: true,
                    },
                    items: {
                      type: 'string',
                    },
                  },
                  tags: {
                    type: 'array',
                    xml: {
                      name: 'tag',
                      wrapped: true,
                    },
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          format: 'int64',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                      xml: {
                        name: 'Tag',
                      },
                    },
                  },
                  status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                  },
                },
                xml: {
                  name: 'Pet',
                },
              },
            },
          },
          required: true,
        },
        responses: {
          '404': {
            description: 'Pet not found',
            content: {},
          },
          '405': {
            description: 'Validation exception',
            content: {},
          },
        },
      },
    },
    '/pet/findByStatus': {
      get: {
        tags: ['pet'],
        summary: 'Finds Pets by status',
        description:
          'Multiple status values can be provided with comma separated strings',
        operationId: 'findPetsByStatus',
        parameters: [
          {
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
        ],
        responses: {
          '200': {
            description: 'successful operation',
            content: {
              'application/xml': {
                schema: {
                  type: 'array',
                  items: {
                    required: ['name', 'photoUrls'],
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      category: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            format: 'int64',
                          },
                          name: {
                            type: 'string',
                          },
                        },
                        xml: {
                          name: 'Category',
                        },
                      },
                      name: {
                        type: 'string',
                        example: 'doggie',
                      },
                      photoUrls: {
                        type: 'array',
                        xml: {
                          name: 'photoUrl',
                          wrapped: true,
                        },
                        items: {
                          type: 'string',
                        },
                      },
                      tags: {
                        type: 'array',
                        xml: {
                          name: 'tag',
                          wrapped: true,
                        },
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'integer',
                              format: 'int64',
                            },
                            name: {
                              type: 'string',
                            },
                          },
                          xml: {
                            name: 'Tag',
                          },
                        },
                      },
                      status: {
                        type: 'string',
                        description: 'pet status in the store',
                        enum: ['available', 'pending', 'sold'],
                      },
                    },
                    xml: {
                      name: 'Pet',
                    },
                  },
                },
              },
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    required: ['name', 'photoUrls'],
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      category: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            format: 'int64',
                          },
                          name: {
                            type: 'string',
                          },
                        },
                        xml: {
                          name: 'Category',
                        },
                      },
                      name: {
                        type: 'string',
                        example: 'doggie',
                      },
                      photoUrls: {
                        type: 'array',
                        xml: {
                          name: 'photoUrl',
                          wrapped: true,
                        },
                        items: {
                          type: 'string',
                        },
                      },
                      tags: {
                        type: 'array',
                        xml: {
                          name: 'tag',
                          wrapped: true,
                        },
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'integer',
                              format: 'int64',
                            },
                            name: {
                              type: 'string',
                            },
                          },
                          xml: {
                            name: 'Tag',
                          },
                        },
                      },
                      status: {
                        type: 'string',
                        description: 'pet status in the store',
                        enum: ['available', 'pending', 'sold'],
                      },
                    },
                    xml: {
                      name: 'Pet',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid status value',
            content: {},
          },
        },
        security: [
          {
            petstore_auth: ['write:pets', 'read:pets'],
          },
        ],
      },
    },
    '/pet/findByTags': {
      get: {
        tags: ['pet'],
        summary: 'Finds Pets by tags',
        description:
          'Muliple tags can be provided with comma separated strings. Use         tag1, tag2, tag3 for testing.',
        operationId: 'findPetsByTags',
        parameters: [
          {
            name: 'tags',
            in: 'query',
            description: 'Tags to filter by',
            required: true,
            style: 'form',
            explode: true,
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'successful operation',
            content: {
              'application/xml': {
                schema: {
                  type: 'array',
                  items: {
                    required: ['name', 'photoUrls'],
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      category: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            format: 'int64',
                          },
                          name: {
                            type: 'string',
                          },
                        },
                        xml: {
                          name: 'Category',
                        },
                      },
                      name: {
                        type: 'string',
                        example: 'doggie',
                      },
                      photoUrls: {
                        type: 'array',
                        xml: {
                          name: 'photoUrl',
                          wrapped: true,
                        },
                        items: {
                          type: 'string',
                        },
                      },
                      tags: {
                        type: 'array',
                        xml: {
                          name: 'tag',
                          wrapped: true,
                        },
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'integer',
                              format: 'int64',
                            },
                            name: {
                              type: 'string',
                            },
                          },
                          xml: {
                            name: 'Tag',
                          },
                        },
                      },
                      status: {
                        type: 'string',
                        description: 'pet status in the store',
                        enum: ['available', 'pending', 'sold'],
                      },
                    },
                    xml: {
                      name: 'Pet',
                    },
                  },
                },
              },
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    required: ['name', 'photoUrls'],
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                      category: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            format: 'int64',
                          },
                          name: {
                            type: 'string',
                          },
                        },
                        xml: {
                          name: 'Category',
                        },
                      },
                      name: {
                        type: 'string',
                        example: 'doggie',
                      },
                      photoUrls: {
                        type: 'array',
                        xml: {
                          name: 'photoUrl',
                          wrapped: true,
                        },
                        items: {
                          type: 'string',
                        },
                      },
                      tags: {
                        type: 'array',
                        xml: {
                          name: 'tag',
                          wrapped: true,
                        },
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'integer',
                              format: 'int64',
                            },
                            name: {
                              type: 'string',
                            },
                          },
                          xml: {
                            name: 'Tag',
                          },
                        },
                      },
                      status: {
                        type: 'string',
                        description: 'pet status in the store',
                        enum: ['available', 'pending', 'sold'],
                      },
                    },
                    xml: {
                      name: 'Pet',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid tag value',
            content: {},
          },
        },
        deprecated: true,
        security: [
          {
            petstore_auth: ['write:pets', 'read:pets'],
          },
        ],
      },
    },
    '/store/order/{orderId}': {
      get: {
        tags: ['store'],
        summary: 'Find purchase order by ID',
        description:
          'For valid response try integer IDs with value >= 1 and <= 10.         Other values will generated exceptions',
        operationId: 'getOrderById',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            description: 'ID of pet that needs to be fetched',
            required: true,
            schema: {
              maximum: 10,
              minimum: 1,
              type: 'integer',
              format: 'int64',
            },
          },
        ],
        responses: {
          '200': {
            description: 'successful operation',
            content: {
              'application/xml': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    petId: {
                      type: 'integer',
                      format: 'int64',
                    },
                    quantity: {
                      type: 'integer',
                      format: 'int32',
                    },
                    shipDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    status: {
                      type: 'string',
                      description: 'Order Status',
                      enum: ['placed', 'delivered', 'canceled'],
                    },
                    summary: {
                      type: 'string',
                      description: 'Human readable summary of order',
                    },
                    complete: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  xml: {
                    name: 'Order',
                  },
                },
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    petId: {
                      type: 'integer',
                      format: 'int64',
                    },
                    quantity: {
                      type: 'integer',
                      format: 'int32',
                    },
                    shipDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    status: {
                      type: 'string',
                      description: 'Order Status',
                      enum: ['placed', 'delivered', 'canceled'],
                    },
                    summary: {
                      type: 'string',
                      description: 'Human readable summary of order',
                    },
                    complete: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  xml: {
                    name: 'Order',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid ID supplied',
            content: {},
          },
          '404': {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'integer',
                      format: 'int32',
                    },
                    type: {
                      type: 'string',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['store'],
        summary: 'Delete purchase order by ID',
        description:
          'For valid response try integer IDs with positive integer value.         Negative or non-integer values will generate API errors',
        operationId: 'deleteOrder',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            description: 'ID of the order that needs to be deleted',
            required: true,
            schema: {
              minimum: 1,
              type: 'integer',
              format: 'int64',
            },
          },
        ],
        responses: {
          '400': {
            description: 'Invalid ID supplied',
            content: {},
          },
          '404': {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'integer',
                      format: 'int32',
                    },
                    type: {
                      type: 'string',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/user/createWithArray': {
      post: {
        tags: ['user'],
        summary: 'Creates list of users with given input array',
        operationId: 'createUsersWithArrayInput',
        requestBody: {
          description: 'List of user object',
          content: {
            '*/*': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'email', 'username', 'userStatus'],
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    username: {
                      type: 'string',
                    },
                    firstName: {
                      type: 'string',
                    },
                    lastName: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    password: {
                      type: 'string',
                    },
                    userStatus: {
                      type: 'string',
                      description: 'User Status',
                      enum: ['activation-pending', 'activated', 'blocked'],
                    },
                    bio: {
                      type: 'string',
                    },
                  },
                  xml: {
                    name: 'User',
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          default: {
            description: 'successful operation',
            content: {},
          },
        },
        'x-codegen-request-body-name': 'body',
      },
    },
  },
} as OpenAPIV3.Document;

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
      jsonPath: '/paths/~1pet/put',
      conceptualPath: ['operations', '/pet', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/pet' },
    },
    value: { operationId: 'putpet', method: 'put', pathPattern: '/pet' },
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
      jsonPath: '/paths/~1pet/put',
      conceptualPath: ['operations', '/pet', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/pet' },
    },
    value: {
      tags: ['pet'],
      summary: 'Add a new pet to the store',
      operationId: 'putpet-change',
      method: 'put',
      pathPattern: '/pet',
    },
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
      jsonPath: '/paths/~1pet/put',
      conceptualPath: ['operations', '/pet', 'put'],
      kind: 'operation',
      conceptualLocation: { method: 'put', path: '/pet' },
    },
    changed: {
      before: { operationId: 'putpet', method: 'put', pathPattern: '/pet' },
      after: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        operationId: 'putpet-change',
        method: 'put',
        pathPattern: '/pet',
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
] as IChange[];
