import { CapturedBody } from './body';
import { OpenAPIV3 } from '../specs';
import { HttpArchive } from './streams/sources/har';
import { ProxySource } from './streams/sources/proxy';
import { URL } from 'url';
import { HttpMethods, Operation } from '../operations';
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
    invariant(
      Operation.isHttpMethod(method),
      `expect HAR entry to have a valid request method`
    );

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

  static fromProxyInteraction(
    proxyInteraction: ProxySource.Interaction
  ): CapturedInteraction {
    const url = new URL(proxyInteraction.request.url);

    const method = HttpMethods[proxyInteraction.request.method];
    invariant(
      Operation.isHttpMethod(method),
      `expect proxy interaction to have a valid request method`
    );

    let requestBody: CapturedBody | null = null;
    let responseBody: CapturedBody | null = null;

    const requestBodyBuffer = proxyInteraction.request.body.buffer;
    if (requestBodyBuffer.length > 0) {
      let contentType = proxyInteraction.request.headers['content-type'];
      let contentLength = proxyInteraction.request.headers['content-length'];

      requestBody = CapturedBody.from(
        requestBodyBuffer,
        contentType || null,
        contentLength ? parseInt(contentLength, 10) : 0
      );
    }

    const responseBodyBuffer = proxyInteraction.response.body.buffer;
    if (responseBodyBuffer.length > 0) {
      let contentType = proxyInteraction.response.headers['content-type'];
      let contentLength = proxyInteraction.response.headers['content-length'];

      responseBody = CapturedBody.from(
        responseBodyBuffer,
        contentType || null,
        contentLength ? parseInt(contentLength, 10) : 0
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
        statusCode: '' + proxyInteraction.response.statusCode,
        body: responseBody,
      },
    };
  }
}

export type CapturedRequest = CapturedInteraction['request'];
export type CapturedResponse = CapturedInteraction['response'];
