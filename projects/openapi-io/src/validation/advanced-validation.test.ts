import { it, expect } from '@jest/globals';
import { validateSchema } from './advanced-validation';

it('a polymorphic schema have overlapping keywords type', () => {
  expect(() =>
    validateSchema({ oneOf: [], anyOf: [], allOf: [] })
  ).toThrowErrorMatchingInlineSnapshot(
    `"schema with oneOf cannot also include keywords: allOf, anyOf"`
  );
});

it('an object schema cannot have array items', () => {
  expect(() =>
    // @ts-ignore
    validateSchema({ type: 'object', items: [] })
  ).toThrowErrorMatchingInlineSnapshot(
    `"schema with type "object" cannot also include keywords: items"`
  );
});
it('an array schema cannot have properties or required', () => {
  expect(() =>
    // @ts-ignore
    validateSchema({ type: 'array', required: [], properties: {} })
  ).toThrowErrorMatchingInlineSnapshot(
    `"schema with type "array" cannot also include keywords: properties, required"`
  );
});
