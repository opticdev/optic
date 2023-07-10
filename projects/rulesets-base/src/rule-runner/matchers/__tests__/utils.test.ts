import { test, expect, describe } from '@jest/globals';
import { valuesMatcher, Matcher, Matchers } from '../utils';
import { exampleJsonSpec } from './petstore.base';

describe('valuesMatcher', () => {
  describe('matching openapi specs', () => {
    test('matches an object', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/store/order'].post.responses[200].content[
          'application/json'
        ].schema;
      const reference = {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          petId: { type: 'integer' },
          quantity: {},
        },
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const referenceWithExtraKey = {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          petId: { type: 'integer' },
          quantitabc: {},
        },
      };

      expect(valuesMatcher(referenceWithExtraKey, valueToMatch)).toBe(false);

      const referenceWithDifferentFormat = {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int32' },
          petId: { type: 'integer' },
        },
      };

      expect(valuesMatcher(referenceWithDifferentFormat, valueToMatch)).toBe(
        false
      );
    });

    test('matches a nested array', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/pet/{petId}/uploadImage'].post;
      const reference = {
        security: [{ petstore_auth: ['read:pets', 'write:pets'] }],
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const referenceWithMoreArrayItems = {
        security: [{ petstore_auth: ['read:pets', 'write:pets', 'hello'] }],
      };
      expect(valuesMatcher(referenceWithMoreArrayItems, valueToMatch)).toBe(
        false
      );
    });

    test('partial matches a nested array', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/pet/{petId}/uploadImage'].post;
      const reference = {
        security: [{ petstore_auth: ['read:pets'] }],
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);
    });
  });

  describe('custom matchers', () => {
    test('string', () => {
      const valueToMatch = exampleJsonSpec.info;
      const reference = {
        termsOfService: Matchers.string,
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const nonMatchedReference = {
        version: Matchers.string,
      };
      expect(valuesMatcher(nonMatchedReference, valueToMatch)).toBe(false);
    });

    test('boolean', () => {
      const valueToMatch = exampleJsonSpec.info;
      const reference = {
        published: Matchers.boolean,
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const nonMatchedReference = {
        termsOfService: Matchers.boolean,
      };
      expect(valuesMatcher(nonMatchedReference, valueToMatch)).toBe(false);
    });

    test('number', () => {
      const valueToMatch = exampleJsonSpec.info;
      const reference = {
        version: Matchers.number,
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const nonMatchedReference = {
        termsOfService: Matchers.number,
      };
      expect(valuesMatcher(nonMatchedReference, valueToMatch)).toBe(false);
    });

    test('custom implementation', () => {
      const urlMatcher = new Matcher(
        (value: any) => typeof value === 'string' && /^https?/i.test(value)
      );
      const valueToMatch = exampleJsonSpec.info;
      const reference = {
        termsOfService: urlMatcher,
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const nonMatchedReference = {
        description: urlMatcher,
      };
      expect(valuesMatcher(nonMatchedReference, valueToMatch)).toBe(false);
    });
  });

  describe('array matching', () => {
    test('with nested objects', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/pet/{petId}/uploadImage'].post.responses[200]
          .content['application/json'].schema;
      const reference = {
        type: 'object',
        properties: {
          expandableObject: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  orderId: {},
                },
              },
              {
                type: 'object',
                properties: {
                  order: {
                    type: 'object',
                  },
                },
              },
            ],
          },
        },
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(true);

      const referenceWithMismatchedType = {
        type: 'object',
        properties: {
          expandableObject: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  orderId: { type: 'number' },
                },
              },
              {
                type: 'object',
                properties: {
                  order: {
                    type: 'object',
                  },
                },
              },
            ],
          },
        },
      };

      expect(valuesMatcher(referenceWithMismatchedType, valueToMatch)).toBe(
        false
      );
    });

    // TODO this needs to be implemented - it doesn't work right now
    test.skip('for references that can only be used once', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/pet/{petId}/uploadImage'].post.responses[200]
          .content['application/json'].schema;
      // These two will be matched by the same object, but should only be used once
      const reference = {
        type: 'object',
        properties: {
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
        },
      };
      expect(valuesMatcher(reference, valueToMatch)).toBe(false);
    });
  });

  describe('strict checks', () => {
    test('object strict checks', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/store/order'].post.responses[200].content[
          'application/json'
        ].schema;
      const reference = {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          petId: { type: 'integer' },
          quantity: {},
        },
      };
      expect(valuesMatcher(reference, valueToMatch, true)).toBe(false);
    });

    test('array strict checks', () => {
      const valueToMatch =
        exampleJsonSpec.paths['/pet/{petId}/uploadImage'].post;
      const reference = {
        security: [{ petstore_auth: ['read:pets'] }],
      };
      expect(valuesMatcher(reference, valueToMatch, true)).toBe(false);
    });
  });

  describe('primitive values', () => {
    test('numbers', () => {
      expect(valuesMatcher(1, 1)).toBe(true);
      expect(valuesMatcher(1, 2)).toBe(false);
    });

    test('strings', () => {
      expect(valuesMatcher('abc', 'abc')).toBe(true);
      expect(valuesMatcher('ab1', 'ab2')).toBe(false);
    });

    test('booleans', () => {
      expect(valuesMatcher(true, true)).toBe(true);
      expect(valuesMatcher(true, false)).toBe(false);
    });

    test('falsy', () => {
      expect(valuesMatcher(null, null)).toBe(true);
      expect(valuesMatcher(undefined, undefined)).toBe(true);

      expect(valuesMatcher(false, null)).toBe(false);
      expect(valuesMatcher(undefined, null)).toBe(false);
      expect(valuesMatcher(undefined, false)).toBe(false);
    });
  });

  test('mismatched types', () => {
    expect(
      valuesMatcher(
        {
          abc: 123,
        },
        null
      )
    ).toBe(false);
    expect(
      valuesMatcher([123, 'abc', 'hello'], {
        abc: 123,
        def: {
          asd: 123,
        },
      })
    ).toBe(false);

    expect(
      valuesMatcher(
        {
          abc: 123,
          def: {
            asd: 123,
          },
        },
        [123, 'abc', 'hello']
      )
    ).toBe(false);
    expect(valuesMatcher(123, '123')).toBe(false);
    expect(valuesMatcher(false, '')).toBe(false);
  });
});
