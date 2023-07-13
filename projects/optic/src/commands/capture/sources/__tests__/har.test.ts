import { it, describe, expect } from '@jest/globals';
import { HarEntries, HttpArchive } from '../har';
import fs from 'fs';
import Path from 'path';
import { Readable } from 'stream';
import { collect, take, unwrap } from '../../../oas/lib/async-tools';

describe('HarEntries', () => {
  it('can be constructed from a readable', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, './fixtures/petstore.swagger.io.har')
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

  describe('will only read HAR files', () => {
    it('will not produce any entries when they do not exist at expected path', async () => {
      let source = fs.createReadStream(
        Path.join(__dirname, './fixtures/githubpaths.json')
      );

      let entries = await collect(HarEntries.fromReadable(source));
      expect(entries).toHaveLength(0);
    });

    it('throws an error when file isnt json', async () => {
      let source = fs.createReadStream(Path.join(__dirname, '../har.ts'));

      const getEntries = async () => {
        await collect(HarEntries.fromReadable(source));
      };

      expect(getEntries).rejects.toThrowError('could not be read as HAR');
    });

    it('allows entry.serverIPAddress to be bracketed ipv6', async () => {
      let source = readableHAR(
        harEntry({
          serverIPAddress: '[::1]',
        })
      );

      let entries = await collect(HarEntries.fromReadable(source));
      expect(entries).toHaveLength(1);

      let entry = entries[0];
      expect(entry.ok).toBe(true);
    });
  });

  it('can be encoded as Readable JSON stream', async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, './fixtures/petstore.swagger.io.har')
    );

    let entries = take<HttpArchive.Entry>(2)(
      unwrap(HarEntries.fromReadable(source))
    );

    let jsonStream = HarEntries.toHarJSON(entries);

    let result = '';
    for await (let chunk of jsonStream) {
      result += chunk.toString('utf-8');
    }

    let parsed;
    expect(() => {
      parsed = JSON.parse(result);
    }).not.toThrow();

    expect(parsed).toMatchSnapshot();
  });
});

function readableHAR(...entries: HttpArchive.Entry[]): Readable {
  return Readable.from(
    Buffer.from(
      JSON.stringify({
        log: { entries },
      })
    ),
    { objectMode: false }
  );
}

function harEntry(attrs: Partial<HttpArchive.Entry> = {}): HttpArchive.Entry {
  return {
    request: harRequest(attrs.request),
    response: harResponse(attrs.response),
    serverIPAddress: '0.0.0.0',
    cache: {},
    timings: {
      send: 1,
      wait: 2,
      receive: 3,
    },
    startedDateTime: new Date().toISOString(),
    time: Date.now(),
    ...attrs,
  };
}

function harRequest(
  attrs: Partial<HttpArchive.Request> = {}
): HttpArchive.Request {
  return {
    method: 'GET',
    url: 'http://example.com',
    cookies: [],
    headers: [],
    queryString: [],
    httpVersion: '1.1',
    headersSize: 0,
    bodySize: 0,
    ...attrs,
  };
}

function harResponse(
  attrs: Partial<HttpArchive.Response> = {}
): HttpArchive.Response {
  return {
    status: 200,
    statusText: 'OK',
    redirectURL: '',
    httpVersion: '1.1',
    cookies: [],
    headers: [],
    headersSize: 0,
    bodySize: 0,
    content: {
      size: 0,
      mimeType: '',
    },
    ...attrs,
  };
}
