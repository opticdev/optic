import { SchemaObject } from '../../../capture/patches/patchers/shapes/schema';

export const rootObjectOrArray = (): SchemaObject => ({
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
});

export const objectOrStringOneOf = (): SchemaObject => ({
  type: 'object',
  properties: {
    location: {
      type: 'object',
      properties: {
        principality: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
            },
            population: {
              type: 'number',
            },
            array: {
              type: 'array',
              items: {
                type: 'number',
              },
            },
            motto: {
              type: 'string',
            },
            coordinates: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    format: {
                      type: 'string',
                    },
                    lat: {
                      type: 'string',
                    },
                    long: {
                      type: 'string',
                    },
                  },
                  required: [],
                },
                {
                  type: 'string',
                },
              ],
            },
          },
          required: ['city', 'population'],
        },
      },
      required: ['principality'],
    },
  },
  required: ['location'],
});
