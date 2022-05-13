import { CapturedInteraction } from './interaction';
import { CapturedBody } from './body';
import { HarEntries, HttpArchive } from './streams/sources/har';
import { collect } from '../lib/async-tools';
import fs from 'fs';
import Path from 'path';

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

    expect(interaction).toMatchSnapshot();
  });

  it('includes request bodies', () => {
    let testEntry = testEntries.find(
      (entry) =>
        entry.request.postData &&
        entry.request.postData.mimeType.startsWith('application/json')
    );
    expect(testEntry).toBeTruthy();

    let interaction = CapturedInteraction.fromHarEntry(testEntry);
    expect(interaction).toMatchSnapshot();

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
    expect(interaction).toMatchSnapshot();

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
    expect(interaction).toMatchSnapshot();

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
    expect(interaction).toMatchSnapshot();

    let parsingBody = CapturedBody.json(interaction.response.body);
    expect(parsingBody).resolves.toMatchObject({});
  });
});
