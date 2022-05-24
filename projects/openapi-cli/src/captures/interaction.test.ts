import { CapturedInteraction } from './interaction';
import { CapturedBody } from './body';
import { HarEntries, HttpArchive } from './streams/sources/har';
import { ProxyInteractions, ProxySource } from './streams/sources/proxy';
import { collect } from '../lib/async-tools';
import fs from 'fs';
import Path from 'path';
import { Readable } from 'stream';

describe('CapturedIntearction.fromHarEntry', () => {
  let testEntries: HttpArchive.Entry[];

  beforeAll(async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, '../tests/inputs/petstore.swagger.io.har')
    );

    testEntries = await collect(HarEntries.fromReadable(source));
  });

  it('can create a CapturedInteraction from a HttpArchive.Entry', () => {
    let testEntry = testEntries[1];
    let interaction = CapturedInteraction.fromHarEntry(testEntry);

    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });
  });

  it('includes request bodies', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.postData &&
        entry.request.postData.mimeType.startsWith('application/json')
    );
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction.request.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('includes response bodies', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.response.content.text &&
        entry.response.content.mimeType.startsWith('application/json')
    );
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction.response.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('supports request body encoding for supported Buffer encodings', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.postData &&
        entry.request.postData.mimeType.startsWith('application/json') &&
        !entry.request.postData.encoding
    );

    let encoding = 'base64';
    testEntry.request.postData.text = Buffer.from(
      testEntry.request.postData.text,
      'utf-8'
    ).toString(encoding as BufferEncoding);
    testEntry.request.postData.encoding = encoding;

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction.request.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('supports response body encoding for supported Buffer encodings', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.response.content.text &&
        entry.response.content.mimeType.startsWith('application/json') &&
        !entry.response.content.encoding
    );

    let encoding = 'base64';
    testEntry.response.content.text = Buffer.from(
      testEntry.response.content.text,
      'utf-8'
    ).toString(encoding as BufferEncoding);
    testEntry.response.content.encoding = encoding;

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction.response.body);
    expect(parsingBody).resolves.toMatchObject({});
  });
});

describe('CapturedInteraction.fromProxyInteraction', () => {
  it('can create a CaturedInteraction from a ProxySource.Interaction', () => {
    let testInteraction = {
      request: proxySourceRequest(),
      response: proxySourceResponse(),
    };
    let interaction = CapturedInteraction.fromProxyInteraction(testInteraction);

    expect(interaction).toMatchSnapshot();
  });

  it('includes request bodies', () => {
    let testInteraction = {
      request: proxySourceRequest(Buffer.from('some-body'), 'text/plain'),
      response: proxySourceResponse(),
    };

    let interaction = CapturedInteraction.fromProxyInteraction(testInteraction);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
    });

    let parsingBody = CapturedBody.text(interaction.request.body);
    expect(parsingBody).resolves.toBe('some-body');
  });

  it('includes response bodies', () => {
    let testBody = { a: 1, b: true, c: { d: 'ok' } };
    let testInteraction = {
      request: proxySourceRequest(),
      response: proxySourceResponse(200, Buffer.from(JSON.stringify(testBody))),
    };

    let interaction = CapturedInteraction.fromProxyInteraction(testInteraction);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction.response.body);
    expect(parsingBody).resolves.toMatchObject(testBody);
  });
});

function matchBody() {
  return { stream: expect.any(Readable) };
}

function proxySourceRequest(
  bodyBuffer?: Buffer,
  contentType?: string
): ProxySource.Request {
  if (!bodyBuffer) {
    bodyBuffer = Buffer.from('');
  }
  let headers = {
    date: 'Mon, 23 May 2022 10:51:19 GMT',
    connection: 'close',
    'transfer-encoding': 'chunked',
  };
  let rawHeaders: [key: string, value: string][] = [
    ['Date', 'Mon, 23 May 2022 10:51:19 GMT'],
    ['Connection', 'close'],
    ['Transfer-Encoding', 'chunked'],
  ];
  if (contentType) {
    headers['content-type'] = contentType;
    rawHeaders.push(['Content-Type', contentType]);

    headers['content-length'] = '' + bodyBuffer.length;
    rawHeaders.push(['Content-Length', '' + bodyBuffer.length]);
  }

  return {
    id: 'test-interaction',
    protocol: 'http',
    httpVersion: '1.1',
    method: 'GET',
    url: 'http://localhost:8001/test-path',
    path: '/test-path',
    headers,
    rawHeaders,
    timingEvents: {
      startTime: 1653303079630,
      startTimestamp: 1731.8688316345215,
      bodyReceivedTimestamp: 1737.7111949920654,
    },
    body: { buffer: bodyBuffer },
  };
}
function proxySourceResponse(
  statusCode: number = 200,
  bodyBuffer?: Buffer,
  contentType?: string
): ProxySource.Response {
  if (!bodyBuffer) {
    bodyBuffer = Buffer.from('');
  }
  let headers = {
    date: 'Mon, 23 May 2022 10:51:19 GMT',
    connection: 'close',
    'transfer-encoding': 'chunked',
  };
  let rawHeaders: [key: string, value: string][] = [
    ['Date', 'Mon, 23 May 2022 10:51:19 GMT'],
    ['Connection', 'close'],
    ['Transfer-Encoding', 'chunked'],
  ];
  if (contentType) {
    headers['content-type'] = contentType;
    rawHeaders.push(['Content-Type', contentType]);
  }

  return {
    id: 'c37e995e-200b-4962-b880-56dc2193a79e',
    statusCode,
    timingEvents: {
      startTime: 1653303079630,
      startTimestamp: 1731.8688316345215,
      bodyReceivedTimestamp: 1737.7111949920654,
      headersSentTimestamp: 1742.967191696167,
      responseSentTimestamp: 1744.1487255096436,
    },
    statusMessage: 'OK',
    headers,
    rawHeaders,
    body: { buffer: bodyBuffer },
  };
}
