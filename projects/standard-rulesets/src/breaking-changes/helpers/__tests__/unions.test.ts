import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3_1 } from '@useoptic/openapi-utilities';
import { computeUnionTransition } from '../unions';

describe('computeUnionTransition', () => {
  describe.each([['narrowing'], ['expanding']])('%s', (type) => {
    describe('transitions', () => {
      describe('type to type', () => {
        test('type is changed', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                },
              },
            },
          };
          const expanded: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                },
              },
            },
          };
          if (type === 'narrowing') {
            expect(computeUnionTransition(expanded, narrowed)).toEqual({
              expanded: true,
              narrowed: true,
            });
          } else {
            expect(computeUnionTransition(narrowed, expanded)).toEqual({
              expanded: true,
              narrowed: true,
            });
          }
        });

        test('type is made optional', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                },
              },
            },
          };
          const expanded: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                },
                required: ['id'],
              },
            },
          };
          if (type === 'narrowing') {
            expect(computeUnionTransition(expanded, narrowed)).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(computeUnionTransition(narrowed, expanded)).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });

        test('type is removed and required', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {},
          };
          const expanded: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
          };
          if (type === 'narrowing') {
            expect(computeUnionTransition(expanded, narrowed)).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(computeUnionTransition(narrowed, expanded)).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });

        test('type is removed but is not required', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {},
          };
          const expanded: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          };

          if (type === 'narrowing') {
            expect(computeUnionTransition(expanded, narrowed)).toEqual({
              expanded: false,
              narrowed: false,
            });
          } else {
            expect(computeUnionTransition(narrowed, expanded)).toEqual({
              expanded: false,
              narrowed: false,
            });
          }
        });
      });

      describe('type array to type array', () => {
        test('type primitives', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              id: {
                type: ['string'],
              },
            },
          };
          const expanded: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              id: {
                type: ['string', 'number'],
              },
            },
          };
          const expandedIdentical: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              id: {
                type: ['number', 'string'],
              },
            },
          };
          if (type === 'narrowing') {
            expect(computeUnionTransition(expanded, narrowed)).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(computeUnionTransition(narrowed, expanded)).toEqual({
              expanded: true,
              narrowed: false,
            });
          }

          expect(computeUnionTransition(expanded, expandedIdentical)).toEqual({
            expanded: false,
            narrowed: false,
          });
        });

        test('valid overlap with object and arrays', () => {
          const s: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              nested: {
                type: ['object', 'string', 'array'],
                properties: {
                  id: {
                    type: 'string',
                  },
                  address: {
                    type: 'object',
                    properties: {
                      street: {
                        type: 'string',
                      },
                    },
                  },
                },
                required: ['id'],
                items: {
                  type: ['boolean', 'number', 'null'],
                },
              },
            },
          };

          expect(computeUnionTransition(s, s)).toEqual({
            narrowed: false,
            expanded: false,
          });
        });

        test('invalid overlap with object and arrays', () => {
          const narrowed: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              nested: {
                type: ['object', 'string', 'array'],
                properties: {
                  id: {
                    type: 'string',
                  },
                  address: {
                    type: 'object',
                    properties: {
                      street: {
                        type: 'string',
                      },
                    },
                  },
                },
                required: ['id'],
                items: {
                  type: ['boolean', 'number', 'null'],
                },
              },
            },
          };
          const expandedObject: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              nested: {
                type: ['object', 'string', 'array'],
                properties: {
                  id: {
                    type: 'string',
                  },
                  address: {
                    type: 'object',
                    properties: {
                      street: {
                        type: 'string',
                      },
                    },
                    required: ['street'],
                  },
                },
                required: ['id'],
                items: {
                  type: ['boolean', 'number', 'null'],
                },
              },
            },
          };
          const expandedArray: OpenAPIV3_1.SchemaObject = {
            type: 'object',
            properties: {
              nested: {
                type: ['object', 'string', 'array'],
                properties: {
                  id: {
                    type: 'string',
                  },
                  address: {
                    type: 'object',
                    properties: {
                      street: {
                        type: 'string',
                      },
                    },
                    required: ['street'],
                  },
                },
                required: ['id'],
                items: {
                  type: ['boolean', 'number', 'null', 'string'],
                },
              },
            },
          };
          if (type === 'narrowing') {
            expect(computeUnionTransition(expandedObject, narrowed)).toEqual({
              expanded: false,
              narrowed: true,
            });
            expect(computeUnionTransition(expandedArray, narrowed)).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(computeUnionTransition(narrowed, expandedObject)).toEqual({
              expanded: true,
              narrowed: false,
            });
            expect(computeUnionTransition(narrowed, expandedArray)).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });
      });

      test('oneOf to oneOf', () => {});

      test('type array to oneOf', () => {});

      test('type to type array', () => {});

      test('type to oneOf', () => {});
    });

    test('oneOf to type array at root schema', () => {});

    test('nested oneOf and type arrays', () => {});
  });
});
