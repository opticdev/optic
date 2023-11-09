import { ono } from '@jsdevtools/ono';
import { ResolverError } from '@apidevtools/json-schema-ref-parser';
import fetch from 'node-fetch';
const url = require('@apidevtools/json-schema-ref-parser/lib/util/url');

import { ExternalRefHandler } from '../types';

export type UserDefinedHeadersByUrlPrefix = {
  headers: { [key: string]: string };
  url_prefix?: string;
}[];

type HeadersByUrlPrefix = Map<
  string | typeof ANY_PREFIX,
  { [key: string]: string }
>;

const ANY_PREFIX = Symbol('Apply to all urls');
const MAX_REDIRECTS = 5;
export const DEFAULT_HEADERS = {
  accept: '*/*',
};

// Selects the most specific urlPrefix to get the header by
export function getMostRelevantHeader(
  url: string,
  headersByUrlPrefix: HeadersByUrlPrefix
): { [key: string]: string } {
  let mostRelevantHeaders: {
    headers: { [key: string]: string };
    relevance: number;
  } = { headers: {}, relevance: -1 };
  for (const [urlPrefix, headers] of headersByUrlPrefix) {
    let relevance = null;
    if (urlPrefix === ANY_PREFIX) {
      relevance = 1;
    } else if (url.startsWith(urlPrefix)) {
      relevance = urlPrefix.length;
    }
    if (relevance !== null && relevance > mostRelevantHeaders.relevance) {
      mostRelevantHeaders = {
        relevance,
        headers,
      };
    }
  }

  return mostRelevantHeaders.headers;
}

async function download(
  url: string,
  headersByUrlPrefix: HeadersByUrlPrefix,
  redirects: string[] = []
): Promise<string> {
  const headers = {
    ...DEFAULT_HEADERS,
    ...getMostRelevantHeader(url, headersByUrlPrefix),
  };

  const response = await fetch(url, {
    headers,
  });
  redirects = [...redirects, url];

  if (response.status >= 400) {
    throw ono({ status: response.status }, `HTTP ERROR ${response.status}`);
  } else if (response.status >= 300) {
    if (redirects.length > MAX_REDIRECTS) {
      throw new ResolverError(
        ono(
          { status: response.status },
          `Error downloading ${
            redirects[0]
          }. \nToo many redirects: \n  ${redirects.join(' \n  ')}`
        ),
        ''
      );
    } else if (
      !('location' in response.headers) ||
      !response.headers.location ||
      typeof response.headers.location !== 'string'
    ) {
      throw ono(
        { status: response.status },
        `HTTP ${response.status} redirect with no location header`
      );
    } else {
      return download(response.headers.location, headersByUrlPrefix, redirects);
    }
  } else {
    return response.text();
  }
}

export function parseHeadersConfig(
  headersByUrlPrefix: UserDefinedHeadersByUrlPrefix
): HeadersByUrlPrefix {
  const prefixMap: HeadersByUrlPrefix = new Map();
  for (const conf of headersByUrlPrefix) {
    const key = conf.url_prefix ?? ANY_PREFIX;
    prefixMap.set(key, conf.headers);
  }

  return prefixMap;
}

export const customHttpResolver = (
  headersByUrlPrefix: HeadersByUrlPrefix
): ExternalRefHandler => {
  return {
    order: 100,
    canRead: (file) => {
      return url.isHttp(file.url);
    },
    read: (file) => {
      return download(file.url, headersByUrlPrefix);
    },
  };
};
