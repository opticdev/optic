import { CapturedBody } from './body';
import { OpenAPIV3 } from '../specs';
import { HttpArchive } from './streams/sources/har';
import { URL } from 'url';
import { HttpMethods } from '../operations';
import invariant from 'ts-invariant';

export interface CapturedInteraction {
  request: {
    host: string;
    method: OpenAPIV3.HttpMethods;
    path: string;
    body: CapturedBody | null;
    // TODO: add support for headers and query params
  };
  response: {
    statusCode: string;
    body: CapturedBody | null;
    // TODO: add support headers
  };
}
export class CapturedInteraction {
  static fromHarEntry(entry: HttpArchive.Entry): CapturedInteraction {
    const url = new URL(entry.request.url);

    const method = HttpMethods[entry.request.method];

    return {
      request: {
        host: url.hostname,
        method,
        path: url.pathname,
        body: null,
      },
      response: {
        statusCode: '' + entry.response.status,
        body: null,
      },
    };
  }
}

export type CapturedRequest = CapturedInteraction['request'];
export type CapturedResponse = CapturedInteraction['response'];
