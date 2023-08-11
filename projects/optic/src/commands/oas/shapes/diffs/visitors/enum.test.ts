import { it, describe, expect } from '@jest/globals';
import { diffBodyBySchema } from '..';
import { SchemaObject } from '../../';

describe('enum json schema diff visitor', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ready', 'not_ready'] },
    },
  };

  it('when valid, no diff', () => {
    const input = {
      status: 'ready',
    };
    const diffs = diffBodyBySchema({ value: input }, jsonSchema);
    expect([...diffs]).toHaveLength(0);
  });

  it('when missing enum value', () => {
    const input = {
      status: 'new-field',
    };
    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];
    expect(diffs).toHaveLength(1);
    expect(diffs).toMatchSnapshot();
  });
});
