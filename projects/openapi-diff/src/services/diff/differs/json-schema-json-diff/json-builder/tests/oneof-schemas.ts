import { OpenAPIV3 } from 'openapi-types';

export const rootObjectOrArray: OpenAPIV3.SchemaObject = {
  oneOf: [
    {
      type: 'object',
      properties: {
        nemesis: {
          type: 'string',
        },
      },
      required: ['nemesis'],
    },
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          food: {
            type: 'string',
          },
        },
        required: ['food'],
      },
    },
  ],
};
