import { Readable } from 'stream';
import { Result, Ok, Err } from 'ts-results';
import invariant from 'ts-invariant';
import { withParser as pickWithParser } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain'; // replace with  stream.compose once it stabilises

export type PostmanEntry = {
  // TODO specify the postman collection type here
};

export interface PostmanCollectionEntries extends AsyncIterable<PostmanEntry> {}
export interface TryPostmanCollection
  extends AsyncIterable<Result<PostmanEntry, Error>> {}

export class PostmanCollectionEntries {
  static async *fromReadable(source: Readable): TryPostmanCollection {
    invariant(
      !source.readableObjectMode,
      'Expecting raw bytes to parse har entries'
    );

    const parseEntries = pickWithParser({
      filter: 'path.to.collection', // TODO - specify path to json format, path to collection rows
      pathSeparator: '.',
    });
    const streamEntries = streamArray();

    const rawEntries = chain([source, parseEntries, streamEntries]);

    // TODO - maybe validate here - Can return `Err()`
    for await (let { value } of rawEntries) {
      Ok(value);
    }
  }
}
