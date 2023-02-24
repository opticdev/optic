import { describe, it, expect } from '@jest/globals';
import { computeCloseness, walkSchema } from './closeness';
import { FlatOpenAPIV3 } from '@useoptic/openapi-utilities';

const merged: FlatOpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['a'],
  properties: {
    a: {
      type: 'string',
    },
    b: {
      type: 'number',
    },
  },
};
const composed: FlatOpenAPIV3.SchemaObject = {
  allOf: [
    {
      type: 'object',
      required: ['a'],
      properties: {
        a: {
          type: 'string',
        },
      },
    },
    {
      type: 'object',
      required: ['b'],
      properties: {
        b: {
          type: 'number',
        },
      },
    },
  ],
};
const schemaA: FlatOpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['a', 'c'],
  properties: {
    a: {
      type: 'string',
    },

    b: {
      type: 'number',
    },
    c: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

const schemaB: FlatOpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['a'],
  properties: {
    a: {
      type: 'string',
    },

    b: {
      type: 'string',
    },
    c: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    d: {
      type: 'boolean',
    },
  },
};
const schemaC: FlatOpenAPIV3.SchemaObject = {
  type: 'array',
  items: {
    type: 'string',
  },
};

describe('can walk schema', () => {
  it('works for a basic schema', () => {
    expect(walkSchema(schemaA)).toMatchSnapshot();
  });
});

describe('compare closeness', () => {
  it('close score for a close schema', () => {
    expect(computeCloseness(schemaA, schemaB)).toMatchInlineSnapshot(
      `0.7142857142857143`
    );
  });

  it('scores are always commutative for a close schema', () => {
    expect(computeCloseness(schemaA, schemaB)).toEqual(
      computeCloseness(schemaB, schemaA)
    );
  });

  it('far away score for different root types', () => {
    expect(computeCloseness(schemaA, schemaC)).toMatchInlineSnapshot(`0`);
  });

  it('allOf is walked as a merge', () => {
    expect(walkSchema(composed)).toMatchSnapshot();
  });

  it('merged and allOfs look the same', () => {
    expect(computeCloseness(merged, composed)).toMatchInlineSnapshot(`1`);
  });
});
