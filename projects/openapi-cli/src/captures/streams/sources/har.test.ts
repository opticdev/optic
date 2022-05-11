import { HarEntries } from './har';
import fs from 'fs';
import Path from 'path';
import { collect } from '../../../lib/async-tools';

describe('HarEntries', () => {
  it('can be constructed from a readable', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, '../../../tests/inputs/petstore.swagger.io.har')
    );

    let entries = HarEntries.fromReadable(source);
    let entriesArray = await collect(entries);

    expect(entriesArray.length).toBeGreaterThan(0);
  });

  it('propagates errors in I/O', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, 'not-actually-a-file')
    );

    const getEntries = async () => {
      let entries = HarEntries.fromReadable(source);

      await collect(entries);
    };

    expect(getEntries).rejects.toThrowError('ENOENT');
  });
});
