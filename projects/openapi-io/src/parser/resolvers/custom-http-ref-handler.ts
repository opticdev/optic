import { ono } from '@jsdevtools/ono';
import { ResolverError } from '@apidevtools/json-schema-ref-parser';
import fetch from 'node-fetch';
const url = require('@apidevtools/json-schema-ref-parser/lib/util/url');

import { ExternalRefHandler } from '../types';

export type HeadersByDomain = Map<
  string | typeof ANY_DOMAIN,
  { [key: string]: string }
>;
export const ANY_DOMAIN = Symbol('Apply to all domains');
const MAX_REDIRECTS = 5;
const DEFAULT_HEADERS = {
  accept: '*/*',
};

// Selects the most specific domain to get the header by
function getMostRelevantHeader(
  url: string,
  headersByDomain: HeadersByDomain
): { [key: string]: string } {
  let mostRelevantHeaders: {
    headers: { [key: string]: string };
    relevance: number;
  } = { headers: {}, relevance: -1 };
  for (const [domain, headers] of headersByDomain) {
    let relevance = null;
    if (domain === ANY_DOMAIN) {
      relevance = 1;
    } else if (url.startsWith(domain)) {
      relevance = domain.length;
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
  headersByDomain: HeadersByDomain,
  redirects: string[] = []
): Promise<string> {
  const headers = {
    ...DEFAULT_HEADERS,
    ...getMostRelevantHeader(url, headersByDomain),
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
      return download(response.headers.location, headersByDomain, redirects);
    }
  } else {
    return response.text();
  }
}

export const customHttpResolver = (
  headersByDomain: HeadersByDomain
): ExternalRefHandler => ({
  order: 100,
  canRead: (file) => {
    return url.isHttp(file.url);
  },
  read: (file) => {
    return new Promise(async (resolve, reject) => {
      resolve(await download(file.url, headersByDomain));
    });
  },
});
