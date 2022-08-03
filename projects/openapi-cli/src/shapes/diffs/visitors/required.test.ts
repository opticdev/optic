import { diffValueBySchema } from '..';
import { SchemaObject } from '../../schema';

describe('required json schema diff visitor', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      hello: {
        type: 'object',
        required: ['f1', 'f2', 'f3'],
        properties: {
          f1: { type: 'string' },
          f2: { type: 'number' },
          f3: { type: 'object' },
        },
      },
    },
  };

  it("missing required fields'", () => {
    const input = {
      hello: { f1: 'value', f2: 122 },
    };

    const diffs = diffValueBySchema(input, jsonSchema);

    expect([...diffs]).toMatchSnapshot();
  });
});
