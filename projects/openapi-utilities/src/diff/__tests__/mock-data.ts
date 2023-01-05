import { OpenAPIV3 } from 'openapi-types';

export const before: OpenAPIV3.Document = {
  info: { version: 'version', title: 'openapi before' },
  openapi: '3.0.3',
  paths: {
    '/api/users': {
      post: {
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
      get: {
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
          required: true,
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
    '/example': {
      get: {
        operationId: 'getExamples',
        parameters: [
          {
            name: 'optionalToRequired',
            in: 'query',
            description: 'The user name for login',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'requiredToOptional',
            in: 'query',
            description: 'The user name for login',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'deletedQueryParameter',
            in: 'query',
            description: 'The user name for login',
            required: true,
            schema: {
              type: 'string',
            },
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
                    requiredKeys: {
                      type: 'object',
                      properties: {
                        optionalToRequired: { type: 'string' },
                        requiredToOptional: { type: 'string' },
                        deletedRequiredKey: { type: 'string' },
                      },
                      required: ['requiredToOptional', 'deletedRequiredKey'],
                    },
                    nullableToNonNullable: {
                      type: 'string',
                      nullable: true,
                    },
                    nonNullableToNullable: {
                      type: 'string',
                    },
                    fromTypeArrays: {
                      type: ['string', 'number'] as any,
                    },
                    toTypeArrays: {
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
  },
};

export const after: OpenAPIV3.Document = {
  info: { version: 'version', title: 'openapi after' },
  openapi: '3.0.3',
  paths: {
    '/api/users': {
      get: {
        requestBody: {
          description: 'Pet object that needs to be added to the store',
          content: {
            'application/json': {
              schema: {
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
          required: true,
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
    '/example': {
      get: {
        operationId: 'getExamples',
        parameters: [
          {
            name: 'optionalToRequired',
            in: 'query',
            description: 'The user name for login',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'requiredToOptional',
            in: 'query',
            description: 'The user name for login',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'addedQueryParameter',
            in: 'query',
            description: 'The user name for login',
            required: true,
            schema: {
              type: 'string',
            },
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
                    requiredKeys: {
                      type: 'object',
                      properties: {
                        optionalToRequired: { type: 'string' },
                        requiredToOptional: { type: 'string' },
                        addedRequiredKey: { type: 'string' },
                      },
                      required: ['optionalToRequired', 'addedRequiredKey'],
                    },
                    nullableToNonNullable: {
                      type: 'string',
                    },
                    nonNullableToNullable: {
                      type: 'string',
                      nullable: true,
                    },
                    toTypeArrays: {
                      type: ['string', 'number'] as any,
                    },
                    fromTypeArrays: {
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
  },
};
