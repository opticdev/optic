import avro from 'avsc';
export const schema: any = {
  type: 'record',
  name: 'InteractionBatch',
  namespace: 'com.useoptic.types.capture',
  fields: [
    {
      name: 'groupingIdentifiers',
      type: {
        type: 'record',
        name: 'GroupingIdentifiers',
        fields: [
          { name: 'agentGroupId', type: 'string' },
          { name: 'captureId', type: 'string' },
          { name: 'agentId', type: 'string' },
          { name: 'batchId', type: 'string' },
        ],
      },
    },
    {
      name: 'batchItems',
      type: {
        type: 'array',
        items: {
          type: 'record',
          name: 'HttpInteraction',
          fields: [
            { name: 'uuid', type: 'string' },
            {
              name: 'request',
              type: {
                type: 'record',
                name: 'Request',
                fields: [
                  { name: 'host', type: 'string' },
                  { name: 'method', type: 'string' },
                  { name: 'path', type: 'string' },
                  {
                    name: 'query',
                    type: {
                      type: 'record',
                      name: 'ArbitraryData',
                      fields: [
                        {
                          name: 'shapeHashV1Base64',
                          type: ['null', 'string'],
                          default: null,
                        },
                        {
                          name: 'asJsonString',
                          type: ['null', 'string'],
                          default: null,
                        },
                        {
                          name: 'asText',
                          type: ['null', 'string'],
                          default: null,
                        },
                      ],
                    },
                  },
                  { name: 'headers', type: 'ArbitraryData' },
                  {
                    name: 'body',
                    type: {
                      type: 'record',
                      name: 'Body',
                      fields: [
                        { name: 'contentType', type: ['null', 'string'] },
                        { name: 'value', type: 'ArbitraryData' },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: 'response',
              type: {
                type: 'record',
                name: 'Response',
                fields: [
                  { name: 'statusCode', type: 'int' },
                  { name: 'headers', type: 'ArbitraryData' },
                  { name: 'body', type: 'Body' },
                ],
              },
            },
            {
              name: 'tags',
              type: {
                type: 'array',
                items: {
                  type: 'record',
                  name: 'HttpInteractionTag',
                  fields: [
                    { name: 'name', type: 'string' },
                    { name: 'value', type: 'string' },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
};
export const serdes = avro.Type.forSchema(schema);
