import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { HttpArchive, HarEntries } from './har';
import { PostmanEntry, PostmanCollectionEntries } from './postman';

import { URL } from 'url';
import { Buffer } from 'buffer';
import { CapturedBody } from './body';
import { logger } from '../../../logger';

type Header = {
  name: string;
  value: string;
};

type Query = {
  name: string;
  value: string;
};

export interface CapturedInteraction {
  request: {
    host: string;
    method: OpenAPIV3.HttpMethods;
    path: string;
    body: CapturedBody | null;
    headers: Header[];
    query: Query[];
  };
  response?: {
    statusCode: string;
    body: CapturedBody | null;
    headers: Header[];
  };
}

export class CapturedInteraction {
  static fromHarEntry(entry: HttpArchive.Entry): CapturedInteraction | null {
    const url = new URL(entry.request.url);

    const method = OpenAPIV3.HttpMethods[entry.request.method];
    if (!method) {
      return null;
    }

    let requestBody: CapturedBody | null = null;
    let responseBody: CapturedBody | null = null;

    const requestPostData = entry.request.postData;
    if (
      requestPostData &&
      requestPostData.text &&
      (!requestPostData.encoding || Buffer.isEncoding(requestPostData.encoding))
    ) {
      let buffer = Buffer.from(
        requestPostData.text,
        requestPostData.encoding as BufferEncoding | undefined
      );

      const asText = new TextDecoder().decode(buffer);

      requestBody = CapturedBody.from(asText, requestPostData.mimeType);
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

      const asText = new TextDecoder().decode(buffer);

      responseBody = CapturedBody.from(asText, responseContent.mimeType);
    }

    const headers = entry.request.headers
      .filter((h) => h.name && h.value)
      .map((h) => ({ name: h.name, value: h.value }));
    const query = entry.request.queryString
      .filter((q) => q.name && q.value)
      .map((q) => ({ name: q.name, value: q.value }));

    const responseHeaders = entry.response.headers
      .filter((h) => h.name && h.value)
      .map((h) => ({ name: h.name, value: h.value }));

    return {
      request: {
        host: url.host,
        method,
        path: url.pathname,
        body: requestBody,
        headers,
        query,
      },
      response: {
        statusCode: '' + entry.response.status,
        body: responseBody,
        headers: responseHeaders,
      },
    };
  }

  static fromPostmanCollection(
    postmanEntry: PostmanEntry
  ): CapturedInteraction | null {
    const { request, response, variableScope } = postmanEntry;
    const resolve = (str: string) => variableScope.replaceIn(str);
    const query = request.url.query.map((query) => ({
      name: resolve(query.key || ''),
      value: resolve(query.value || ''),
    }));

    const method =
      OpenAPIV3.HttpMethods[request.method?.toUpperCase() || 'GET'];
    if (!method) {
      return null;
    }

    const languageMap = {
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      javascript: 'text/javascript',
    };

    const language = request.body?.options?.raw?.language;
    const modeMap = {
      urlencoded: 'application/x-www-form-urlencoded',
      formdata: 'multipart/formdata',
      graphql: 'application/json',
      raw: language && languageMap[language],
    };

    const mode = request.body?.mode;
    const requestContentTypeHeader = request.headers.get('Content-Type');

    // Postman doesn't always include a Content-Type header
    // in the request.  When no Content-Type header exists,
    // the content type may be inferred using other hints in
    // the format.
    const requestContentType = requestContentTypeHeader?.length
      ? resolve(requestContentTypeHeader)
      : (mode && modeMap[mode]) || 'text/plain';

    const requestBodySource = request.body
      ? resolve(request.body.toString())
      : '';

    const responseBodySource = response?.body
      ? resolve(response.body.toString())
      : null;

    return {
      request: {
        host: resolve(request.url.getHost()),
        method,
        path: resolve(request.url.getPath()),
        query,
        headers: request.headers.all().map(({ key, value }) => ({
          name: resolve(key),
          value: resolve(value),
        })),
        body: requestBodySource.length
          ? CapturedBody.from(requestBodySource, requestContentType)
          : null,
      },
      response: response
        ? {
            statusCode: response.code.toString(),
            headers: response.headers.all().map(({ key, value }) => ({
              name: resolve(key),
              value: resolve(value),
            })),
            body: response.body
              ? CapturedBody.from(
                  responseBodySource,
                  response.contentInfo().contentType
                )
              : null,
          }
        : undefined,
    };
  }
}

export type CapturedRequest = CapturedInteraction['request'];
export type CapturedResponse = CapturedInteraction['response'];

export interface CapturedInteractions
  extends AsyncIterable<CapturedInteraction> {}

export class CapturedInteractions {
  static async *fromHarEntries(entries: HarEntries): CapturedInteractions {
    for await (let entry of entries) {
      const capturedInteraction = CapturedInteraction.fromHarEntry(entry);
      if (capturedInteraction) {
        yield capturedInteraction;
      } else {
        logger.debug(`skipping entry ${JSON.stringify(entry)}`);
      }
    }
  }

  static async *fromPostmanCollection(
    entries: PostmanCollectionEntries
  ): CapturedInteractions {
    for await (let entry of entries) {
      const capturedInteraction =
        CapturedInteraction.fromPostmanCollection(entry);
      if (capturedInteraction) {
        yield capturedInteraction;
      } else {
        logger.debug(`skipping entry ${JSON.stringify(entry)}`);
      }
    }
  }
}
