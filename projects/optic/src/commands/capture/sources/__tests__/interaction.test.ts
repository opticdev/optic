import { beforeAll, it, describe, expect } from '@jest/globals';
import { CapturedInteraction } from '../captured-interactions';
import { collect, unwrap } from '../../../oas/lib/async-tools';
import fs from 'fs';
import Path from 'path';
import { Readable } from 'stream';
import { HarEntries, HttpArchive } from '../har';
import { CapturedBody } from '../body';
import { PostmanCollectionEntries, PostmanEntry } from '../postman';
import { ProxySource } from '../proxy';

describe('CapturedIntearction.fromHarEntry', () => {
  let testEntries: HttpArchive.Entry[];

  beforeAll(async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, './fixtures/petstore.swagger.io.har')
    );

    testEntries = await collect(unwrap(HarEntries.fromReadable(source)));
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
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.request.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('includes response bodies', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.response.content.text &&
        entry.response.content.mimeType.startsWith('application/json')
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.response?.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('supports request body encoding for supported Buffer encodings', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.postData &&
        entry.request.postData.mimeType.startsWith('application/json') &&
        !entry.request.postData.encoding
    )!;

    let encoding = 'base64';
    testEntry.request.postData!.text = Buffer.from(
      testEntry.request.postData!.text,
      'utf-8'
    ).toString(encoding as BufferEncoding);
    testEntry.request.postData!.encoding = encoding;

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.request.body);
    expect(parsingBody).resolves.toMatchObject({});
  });

  it('supports response body encoding for supported Buffer encodings', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.response.content.text &&
        entry.response.content.mimeType.startsWith('application/json') &&
        !entry.response.content.encoding
    )!;

    let encoding = 'base64';
    testEntry.response.content.text = Buffer.from(
      testEntry.response.content.text!,
      'utf-8'
    ).toString(encoding as BufferEncoding);
    testEntry.response.content.encoding = encoding;

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.response?.body);
    expect(parsingBody).resolves.toMatchObject({});
  });
});

describe('CapturedInteraction.fromPostmanEntry', () => {
  let testEntries: PostmanEntry[];

  beforeAll(async () => {
    let source = fs.createReadStream(
      Path.join(__dirname, './fixtures/echo.postman_collection.json')
    );

    testEntries = await collect(
      unwrap(PostmanCollectionEntries.fromReadable(source))
    );
  });

  it('can create a CapturedInteraction from a PostmanEntry', () => {
    let testEntry = testEntries[1];
    let interaction = CapturedInteraction.fromPostmanCollection(testEntry);

    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });
  });

  it('includes request bodies with a Content-Type header', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.body &&
        entry.request.headers
          .get('Content-Type')
          ?.startsWith('application/json')
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromPostmanCollection(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.request.body);
    expect(parsingBody).resolves.toBeTruthy();
  });

  it('includes request bodies with no Content-Type header and a JSON language option', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.body?.options?.raw?.language === 'json' &&
        !entry.request.headers.get('Content-Type')
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromPostmanCollection(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.request.body);
    expect(parsingBody).resolves.toBeTruthy();
  });

  it('includes request bodies with no Content-Type header, raw mode, and no language option', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.body?.mode === 'raw' &&
        !entry.request.body?.options?.raw &&
        !entry.request.headers.get('Content-Type')
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromPostmanCollection(testEntry);
    expect(interaction).toMatchSnapshot({
      request: { body: matchBody() },
    });

    let parsingBody = CapturedBody.text(interaction!.request.body!);
    expect(parsingBody).resolves.toBeTruthy();
  });

  it('includes response bodies', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.response &&
        entry.response.body &&
        entry.response.headers
          .get('Content-Type')
          ?.startsWith('application/json')
    )!;
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromPostmanCollection(testEntry);
    expect(interaction).toMatchSnapshot({
      response: { body: matchBody() },
    });

    let parsingBody = CapturedBody.json(interaction!.response?.body);
    expect(parsingBody).resolves.toMatchObject({});
  });
});

function matchBody() {
  return { body: expect.anything() };
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

  headers['content-length'] = '' + bodyBuffer.length;
  rawHeaders.push(['Content-Length', '' + bodyBuffer.length]);

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
