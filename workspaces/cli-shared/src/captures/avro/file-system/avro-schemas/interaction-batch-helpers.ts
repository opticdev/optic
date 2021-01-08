import avro from 'avsc';

const schemaWithBodies: any = {
  type: 'record',
  name: 'HttpInteraction',
  fields: [
    {
      name: 'uuid',
      type: 'string',
    },
    {
      name: 'request',
      type: {
        type: 'record',
        name: 'Request',
        fields: [
          {
            name: 'host',
            type: 'string',
          },
          {
            name: 'method',
            type: 'string',
          },
          {
            name: 'path',
            type: 'string',
          },
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
          {
            name: 'headers',
            type: 'ArbitraryData',
          },
          {
            name: 'body',
            type: {
              type: 'record',
              name: 'Body',
              fields: [
                {
                  name: 'contentType',
                  type: ['null', 'string'],
                },
                {
                  name: 'value',
                  type: 'ArbitraryData',
                },
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
          {
            name: 'statusCode',
            type: 'int',
          },
          {
            name: 'headers',
            type: 'ArbitraryData',
          },
          {
            name: 'body',
            type: 'Body',
          },
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
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'value',
              type: 'string',
            },
          ],
        },
      },
    },
  ],
};

const schemaWithoutBodies: any = {
  type: 'record',
  name: 'HttpInteraction',
  fields: [
    {
      name: 'uuid',
      type: 'string',
    },
    {
      name: 'request',
      type: {
        type: 'record',
        name: 'Request',
        fields: [
          {
            name: 'host',
            type: 'string',
          },
          {
            name: 'method',
            type: 'string',
          },
          {
            name: 'path',
            type: 'string',
          },
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
          {
            name: 'headers',
            type: 'ArbitraryData',
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
          {
            name: 'statusCode',
            type: 'int',
          },
          {
            name: 'headers',
            type: 'ArbitraryData',
          },
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
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'value',
              type: 'string',
            },
          ],
        },
      },
    },
  ],
};
export const serdesWithoutBodies = avro.Type.forSchema(schemaWithoutBodies);
export const serdesWithBodies = avro.Type.forSchema(schemaWithBodies);
