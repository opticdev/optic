import { it, describe, expect } from '@jest/globals';
import { diffValueBySchema, SchemaCompilationError } from '.';

describe('diffValueBySchema', () => {
  it('will return an Err Result when schema isnt valid and cant be compiled', () => {
    let schema = {
      // oneOf: [{ type: 'number' }, { type: 'string' }],
      nullable: true,
    };

    let result = diffValueBySchema(null, schema);
    expect(result.err).toBe(true);
    expect(result.val).toBeInstanceOf(SchemaCompilationError);
  });
});
