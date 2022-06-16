import { diffValueBySchema } from '.';
import { inspect } from 'util';

describe('diffValueBySchema', () => {
  it('will not throw for non-strictly-valid json schemas', () => {
    let schema = {
      // oneOf: [{ type: 'number' }, { type: 'string' }],
      nullable: true,
    };

    try {
      let diffs = [...diffValueBySchema(null, schema)];
    } catch (err) {
      console.log(inspect(err, { depth: 5 }));
    }
  });
});
