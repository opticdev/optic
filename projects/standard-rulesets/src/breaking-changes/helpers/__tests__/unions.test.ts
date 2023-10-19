import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3_1 } from '@useoptic/openapi-utilities';
import { computeUnionTransition } from '../unions';

const schemas: {
  typeArrays: {
    simple: {
      narrowed: OpenAPIV3_1.SchemaObject;
      expanded: OpenAPIV3_1.SchemaObject;
    };
    nested: {
      narrowed: OpenAPIV3_1.SchemaObject;
      expandedObject: OpenAPIV3_1.SchemaObject;
      expandedArray: OpenAPIV3_1.SchemaObject;
    };
  };
  oneOf: {
    simple: {
      narrowed: OpenAPIV3_1.SchemaObject;
      expanded: OpenAPIV3_1.SchemaObject;
    };
    nested: {
      narrowed: OpenAPIV3_1.SchemaObject;
      expandedObject: OpenAPIV3_1.SchemaObject;
      expandedArray: OpenAPIV3_1.SchemaObject;
    };
  };
} = {
  typeArrays: {
    simple: {
      narrowed: {
        type: 'object',
        properties: {
          id: {
            type: ['string'],
          },
        },
      },
      expanded: {
        type: 'object',
        properties: {
          id: {
            type: ['string', 'number'],
          },
        },
      },
    },
    nested: {
      narrowed: {
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
              type: ['boolean', 'number'],
            },
          },
        },
      },
      expandedObject: {
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
              type: ['boolean', 'number'],
            },
          },
        },
      },
      expandedArray: {
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
              type: ['boolean', 'number', 'string'],
            },
          },
        },
      },
    },
  },
  oneOf: {
    simple: {
      narrowed: {
        type: 'object',
        properties: {
          id: {
            oneOf: [{ type: 'string' }],
          },
        },
      },
      expanded: {
        type: 'object',
        properties: {
          id: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
        },
      },
    },
    nested: {
      narrowed: {
        type: 'object',
        properties: {
          nested: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                required: ['id'],
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
              },
              {
                type: 'array',
                items: { oneOf: [{ type: 'boolean' }, { type: 'number' }] },
              },
            ],
          },
        },
      },
      expandedObject: {
        type: 'object',
        properties: {
          nested: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                required: ['id'],
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
              },
              {
                type: 'array',
                items: { oneOf: [{ type: 'boolean' }, { type: 'number' }] },
              },
            ],
          },
        },
      },
      expandedArray: {
        type: 'object',
        properties: {
          nested: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                required: ['id'],
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
              },
              {
                type: 'array',
                items: {
                  oneOf: [
                    { type: 'boolean' },
                    { type: 'number' },
                    { type: 'string' },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
};

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
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.typeArrays.simple.expanded,
                schemas.typeArrays.simple.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.typeArrays.simple.narrowed,
                schemas.typeArrays.simple.expanded
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }

          expect(
            computeUnionTransition(
              schemas.typeArrays.simple.expanded,
              schemas.typeArrays.simple.expanded
            )
          ).toEqual({
            expanded: false,
            narrowed: false,
          });
        });

        test('valid overlap with object and arrays', () => {
          expect(
            computeUnionTransition(
              schemas.typeArrays.nested.narrowed,
              schemas.typeArrays.nested.narrowed
            )
          ).toEqual({
            narrowed: false,
            expanded: false,
          });
        });

        test('invalid overlap with object and arrays', () => {
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.typeArrays.nested.expandedObject,
                schemas.typeArrays.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
            expect(
              computeUnionTransition(
                schemas.typeArrays.nested.expandedArray,
                schemas.typeArrays.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.typeArrays.nested.narrowed,
                schemas.typeArrays.nested.expandedObject
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
            expect(
              computeUnionTransition(
                schemas.typeArrays.nested.narrowed,
                schemas.typeArrays.nested.expandedArray
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });
      });

      describe('oneOf to oneOf', () => {
        test('type primitives', () => {
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.oneOf.simple.expanded,
                schemas.oneOf.simple.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.oneOf.simple.narrowed,
                schemas.oneOf.simple.expanded
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }

          expect(
            computeUnionTransition(
              schemas.oneOf.simple.expanded,
              schemas.oneOf.simple.expanded
            )
          ).toEqual({
            expanded: false,
            narrowed: false,
          });
        });

        test('valid overlap with objects and arrays', () => {
          expect(
            computeUnionTransition(
              schemas.oneOf.nested.narrowed,
              schemas.oneOf.nested.narrowed
            )
          ).toEqual({
            narrowed: false,
            expanded: false,
          });
        });

        test('invalid overlap with objects and arrays', () => {
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.expandedObject,
                schemas.oneOf.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.expandedArray,
                schemas.oneOf.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.narrowed,
                schemas.oneOf.nested.expandedObject
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.narrowed,
                schemas.oneOf.nested.expandedArray
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });
      });

      describe('type array to oneOf', () => {
        test('type primitives', () => {
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.oneOf.simple.expanded,
                schemas.typeArrays.simple.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.oneOf.simple.narrowed,
                schemas.typeArrays.simple.expanded
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }

          expect(
            computeUnionTransition(
              schemas.oneOf.simple.expanded,
              schemas.typeArrays.simple.expanded
            )
          ).toEqual({
            expanded: false,
            narrowed: false,
          });
        });

        test('valid overlap with objects and arrays', () => {
          expect(
            computeUnionTransition(
              schemas.oneOf.nested.narrowed,
              schemas.typeArrays.nested.narrowed
            )
          ).toEqual({
            narrowed: false,
            expanded: false,
          });
        });

        test('invalid overlap with objects and arrays', () => {
          if (type === 'narrowing') {
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.expandedObject,
                schemas.typeArrays.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.expandedArray,
                schemas.typeArrays.nested.narrowed
              )
            ).toEqual({
              expanded: false,
              narrowed: true,
            });
          } else {
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.narrowed,
                schemas.typeArrays.nested.expandedObject
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
            expect(
              computeUnionTransition(
                schemas.oneOf.nested.narrowed,
                schemas.typeArrays.nested.expandedArray
              )
            ).toEqual({
              expanded: true,
              narrowed: false,
            });
          }
        });
      });

      test('type to type array', () => {
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
                  type: ['number', 'string'],
                },
              },
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

      test('type to oneOf', () => {
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
                  oneOf: [{ type: 'number' }, { type: 'string' }],
                },
              },
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
    });

    test('oneOf to type array at root schema', () => {});

    test('nested oneOf and type arrays', () => {});
  });
});
