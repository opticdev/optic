import { Readable, pipeline } from 'stream';
import invariant from 'ts-invariant';
import { withParser as pickWithParser } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain'; // replace with  stream.compose once it stabilises

export interface HarEntries extends AsyncIterable<HttpArchive.Entry> {}

export class HarEntries {
  static async *fromReadable(source: Readable): HarEntries {
    invariant(
      !source.readableObjectMode,
      'Expecting raw bytes to parse har entries'
    );

    const parseEntries = pickWithParser({
      filter: 'log.entries',
      pathSeparator: '.',
    });
    const streamEntries = streamArray();

    const rawEntries = chain([source, parseEntries, streamEntries]);

    for await (let { key, value } of rawEntries) {
      yield value as HttpArchive.Entry; // TODO: validate these entries, because this is risky af
    }
  }
}

export declare namespace HttpArchive {
  interface Entry {
    request: Request;
    response: Response;
    cache: Cache;
    timings: Timings;

    startedDateTime: string;
    time: number;
    serverIPAddress?: string;
    connection?: string;
    comment?: string;
  }

  interface Request {
    method: string;
    url: string;
    httpVersion: string;
    cookies: Cookie[];
    headers: Header[];
    headersSize: number;
    queryString: QueryString[];
    postData?: PostData;
    bodySize: number;
    comment?: string;
  }

  interface Response {
    status: number;
    statusText: string;
    httpVersion: string;
    cookies: Cookie[];
    headers: Header[];
    content: Content;
    redirectURL: string;
    headersSize: number;
    bodySize: number;
    comment?: string;
  }

  interface Header {
    name: string;
    value: string;
    comment?: string;
  }
  interface QueryString {
    name: string;
    value: string;
    comment?: string;
  }

  interface PostData {
    mimeType: string;
    params: Param[];
    text: string;
    comment?: string;
  }
  interface Content {
    size: number;
    compression?: number;
    mimeType: string;
    text?: string;
    encoding?: string;
    comment?: string;
  }

  // TODO: complete the definition as these parts become applicable
  interface Param {}
  interface Cache {}
  interface Timings {}
  interface Cookie {}

  // ancestors of Entry that we haven't found a use for yet
  interface Document {}
  interface Log {}
  interface Creator {}
  interface Browser {}
  interface Page {}
  interface PageTiming {}
}
