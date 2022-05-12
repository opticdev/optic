import { CapturedBody } from './body';
import { OpenAPIV3 } from '../specs';
import { HttpArchive } from './streams/sources/har';
import { URL } from 'url';
import { HttpMethods } from '../operations';
import invariant from 'ts-invariant';
import { Buffer } from 'buffer';

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

    let requestBody: CapturedBody | null = null;
    let responseBody: CapturedBody | null = null;

    const requestPostData = entry.request.postData;
    if (
      requestPostData &&
      (!requestPostData.encoding || Buffer.isEncoding(requestPostData.encoding))
    ) {
      let buffer = Buffer.from(
        requestPostData.text,
        requestPostData.encoding as BufferEncoding | undefined
      );
      requestBody = CapturedBody.from(
        buffer,
        requestPostData.mimeType,
        entry.request.bodySize
      );
    }

    const responseContent = entry.response.content;
    if (
      responseContent.text &&
      (!responseContent.encoding || Buffer.isEncoding(responseContent.encoding))
    ) {
      let buffer = Buffer.from(
        responseContent.text,
        responseContent.encoding as BufferEncoding | undefined
      );
      responseBody = CapturedBody.from(
        buffer,
        responseContent.mimeType,
        responseContent.size
      );
    }

    return {
      request: {
        host: url.hostname,
        method,
        path: url.pathname,
        body: requestBody,
      },
      response: {
        statusCode: '' + entry.response.status,
        body: responseBody,
      },
    };
  }
}

export type CapturedRequest = CapturedInteraction['request'];
export type CapturedResponse = CapturedInteraction['response'];
