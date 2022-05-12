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
});
