import { it, describe, expect } from '@jest/globals';
import { PostmanCollectionEntries } from '../postman';
import fs from 'fs';
import Path from 'path';
import { collect } from '../../../oas/lib/async-tools';

describe('PostmanCollectionEntries', () => {
  it('can be constructed from a readable', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, './fixtures/echo.postman_collection.json')
    );

    let entries = PostmanCollectionEntries.fromReadable(source);
    let entriesArray = await collect(entries);

    expect(entriesArray.length).toBeGreaterThan(0);
  });

  it('propagates errors in I/O', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, 'not-actually-a-file')
    );

    const getEntries = async () => {
      let entries = PostmanCollectionEntries.fromReadable(source);

      await collect(entries);
    };

    expect(getEntries).rejects.toThrowError('ENOENT');
  });

  describe('will only read Postman Collection files', () => {
    it('will not produce any entries when they do not exist at expected path', async () => {
      let source = fs.createReadStream(
        Path.join(__dirname, './fixtures/githubpaths.json')
      );

      let entries = await collect(
        PostmanCollectionEntries.fromReadable(source)
      );
      expect(entries).toHaveLength(0);
    });

    it('throws an error when file isnt json', async () => {
      let source = fs.createReadStream(Path.join(__dirname, './postman.ts'));

      const getEntries = async () => {
        await collect(PostmanCollectionEntries.fromReadable(source));
      };

      expect(getEntries).rejects.toThrowError(
        'could not be read as Postman Collection'
      );
    });
  });
});
