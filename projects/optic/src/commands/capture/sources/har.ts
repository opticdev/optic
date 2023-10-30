import fsSync from 'fs';
import path from 'path';
import fs from 'node:fs/promises';
import { Readable } from 'stream';
import invariant from 'ts-invariant';
import { withParser as pickWithParser } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { disassembler } from 'stream-json/Disassembler';
import { stringer } from 'stream-json/Stringer';
import { chain } from 'stream-chain'; // replace with  stream.compose once it stabilises
import HarSchemas from 'har-schema';
import Ajv, { SchemaObject, ErrorObject } from 'ajv';
import ajvFormats from 'ajv-formats';
import { ProxyInteractions } from '../../oas/captures/proxy';
import isUrl from 'is-url';
import { Result, Ok, Err } from 'ts-results';
import zlib from 'node:zlib';

export async function* getHarEntriesFromFs(harPath: string) {
  const isDir = fsSync.lstatSync(harPath).isDirectory();
  const harPaths = isDir
    ? await fs
        .readdir(harPath)
        .then((paths) =>
          paths
            .filter((p) => path.extname(p).toLowerCase() === '.har')
            .map((p) => path.join(harPath, p))
        )
    : [harPath];

  for (const harPath of harPaths) {
    const harEntries = HarEntries.fromReadable(
      fsSync.createReadStream(harPath)
    );
    yield* harEntries;
  }
}

export interface HarEntries extends AsyncIterable<HttpArchive.Entry> {}
export interface TryHarEntries
  extends AsyncIterable<Result<HttpArchive.Entry, HarEntryValidationError>> {}

export class HarEntries {
  static async *fromReadable(source: Readable): TryHarEntries {
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

    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      schemas: [
        ...Object.values(HarSchemas).map((rawSchema) => {
          let schema = rawSchema as SchemaObject;
          let { $schema, ...rest } = schema;
          return {
            ...rest,
          };
        }),
      ],
    });

    const validator = ajvFormats(ajv, { mode: 'fast' });

    const validate = validator.getSchema<HttpArchive.Entry>('entry.json')!;

    let entryCount = 0;
    try {
      for await (let { value } of rawEntries) {
        entryCount++;
        coerceBracketedIpAddress(value); // workaround Chrome writing IPv6 addresses with brackets around them (parsed from URI)
        if (validate(value)) {
          yield Ok(value);
        } else {
          // TODO: yield a Result, so we can propagate this error rather than deciding on skip here
          let validationError = new HarEntryValidationError(
            value,
            entryCount,
            validate.errors!
          );
          yield Err(validationError);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Parser')) {
        // duck typing, but it's the best we've got
        throw new Error(`Source could not be read as HAR: ${err.message}`);
      } else {
        throw err;
      }
    }
  }

  static async *fromProxyInteractions(
    interactions: ProxyInteractions
  ): HarEntries {
    for await (let interaction of interactions) {
      let httpVersion = interaction.request.httpVersion || '1.1';

      let requestBodyBuffer = interaction.request.body.buffer;
      let requestContentType = interaction.request.headers['content-type'];
      let queryString: HttpArchive.Request['queryString'] = [];
      try {
        const url = new URL(interaction.request.url);
        for (const [name, value] of url.searchParams) {
          queryString.push({ name, value });
        }
      } catch (e) {
        continue;
      }

      const requestBodyEncoded =
        requestContentType &&
        (await toBase64(
          requestBodyBuffer,
          interaction.response.headers['content-encoding']
        ));

      let request: HttpArchive.Request = {
        method: interaction.request.method,
        url: interaction.request.url,
        httpVersion,
        headers: interaction.request.rawHeaders.map(([key, value]) => ({
          name: key,
          value,
        })),
        headersSize: -1, // hard to calculate
        bodySize: interaction.request.body.buffer.length,
        cookies: [], // not available from proxy, but could parse from header
        queryString,
        postData:
          requestContentType && requestBodyEncoded
            ? {
                mimeType: requestContentType,
                text: requestBodyEncoded,
                encoding: 'base64',
                params: [], // not supporting posted formdata
              }
            : undefined,
      };

      let responseBodyBuffer = interaction.response.body.buffer;

      const responseBodyText = await toBase64(
        responseBodyBuffer,
        interaction.response.headers['content-encoding']
      );

      let response: HttpArchive.Response = {
        status: interaction.response.statusCode,
        statusText: interaction.response.statusMessage,
        httpVersion,
        headers: interaction.request.rawHeaders.map(([key, value]) => ({
          name: key,
          value,
        })),
        headersSize: -1, // hard to calculate
        cookies: [], // not available from proxy, but could parse from header
        redirectURL:
          interaction.request.rawHeaders.find(
            ([key]) => key.toLowerCase() === 'location'
          )?.[1] || '',
        bodySize: responseBodyBuffer.length,
        content: {
          mimeType: interaction.response.headers['content-type'] || '',
          size: responseBodyText.length,
          text: responseBodyText,
          encoding: 'base64',
        },
      };

      let requestTiming = interaction.request.timingEvents;

      let startedDateTime = new Date(requestTiming.startTimestamp);

      yield {
        request,
        response,
        cache: {},
        timings: {
          send: 100,
          wait: 100,
          receive: 100,
        },
        startedDateTime: startedDateTime.toISOString(),
        time: 100 + 100 + 100,
      };
    }
  }

  static toHarJSON(entries: HarEntries): Readable {
    const har = {
      log: {
        version: '1.3',
        creator: 'Optic capture command',
        entries: null, // null will be dropped
      },
    };

    let tokens = (async function* () {
      let entriesTokens = chain([Readable.from(entries), disassembler()]);

      let manifestTokens = chain([
        Readable.from(
          (async function* () {
            yield har;
          })()
        ),
        disassembler(),
      ]);

      for await (let token of manifestTokens) {
        if (token.name === 'keyValue' && token.value === 'entries') {
          yield { name: 'startArray' };

          yield* entriesTokens;

          yield { name: 'endArray' };
        } else if (token.name !== 'nullValue') {
          yield token;
        }
      }
    })();

    return Readable.from(tokens).pipe(stringer());
  }
}

/*
  Optic was originally written to support base64 only in these fields. TBD why.
  If we want to work with HARs from other tools we should handle encoding at read-time, not write time

  Currently ok to continue this direction.
 */
async function toBase64(
  buffer: Buffer,
  encodings: string | string[] | undefined
): Promise<string> {
  try {
    const firstEncoding = Array.isArray(encodings) ? encodings[0] : encodings;

    if (Array.isArray(encodings) && encodings.length > 1)
      throw new Error('multiple content-encodinings are not supported');

    switch (firstEncoding) {
      case undefined:
        return buffer.toString('base64');
      case 'gzip':
        return await new Promise((resolve, reject) => {
          zlib.unzip(buffer, (error, result) => {
            if (error) {
              reject('could not decode ' + error.message);
            } else {
              resolve(result.toString('base64'));
            }
          });
        });
      default:
        throw new Error('unsupported encoding ' + firstEncoding);
    }
  } catch (e) {
    return Buffer.from('').toString('base64');
  }
}

// Mutate value by removing square brackets from IPv6 serverIpAddress entries.
// Square brackets are used to allow IPv6 to be used in URIs with (to distinguish
// from the delimeter for port). Chrome must have parsed them from the URI,
// not cleaning them up properly before including them in the HAR?
const ipv6BracketsPattern = /^\[(?<ip>.+)\]$/;
function coerceBracketedIpAddress(value: any) {
  if (value && typeof value.serverIPAddress === 'string') {
    value.serverIPAddress =
      value.serverIPAddress.match(ipv6BracketsPattern)?.groups.ip ||
      value.serverIPAddress;
  }
}

export class HarEntryValidationError extends Error {
  errors: ErrorObject[];

  constructor(
    invalidEntry: any,
    entryIndex: number,
    validationErrors: ErrorObject[]
  ) {
    const request = invalidEntry && invalidEntry.request;
    const url =
      request && request.url && isUrl(request.url) ? request.url : null;
    const descriptions = validationErrors.map(
      (error) => `${error.instancePath} ${error.message}`
    );

    let message = `HAR entry #${entryIndex} not valid.\n${descriptions.map(
      (description) => `  - ${description}\n`
    )}`;
    if (url) {
      message += `\nRequest url: ${url}`;
    }

    super(message);
    this.errors = validationErrors;
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
    encoding?: string;
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
  interface Timings {
    send: number;
    wait: number;
    receive: number;
  }
  interface Cookie {}

  // ancestors of Entry that we haven't found a use for yet
  interface Document {}
  interface Log {}
  interface Creator {}
  interface Browser {}
  interface Page {}
  interface PageTiming {}
}
