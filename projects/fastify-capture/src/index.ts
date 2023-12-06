import type { Log, Entry, Header, Cookie } from 'har-format';
import type { FastifyReply, FastifyRequest } from 'fastify';
import setCookieParser from 'set-cookie-parser';
import cookieParser from 'cookie';
import fs from 'fs';
import path from 'path';
import http from 'http';

type FastifyCaptureOptions = {
  harOutputDir?: string;
  sampleRate?: number;
};

export const fastifyCapture = (options: FastifyCaptureOptions = {}) => {
  const entries: Entry[] = [];
  const harOutputDir = path.resolve(options.harOutputDir ?? 'har-capture');

  const save = () => {
    var now = process.hrtime.bigint().toString();
    if (!entries.length) return;

    if (!fs.existsSync(harOutputDir)) {
      fs.mkdirSync(harOutputDir, { recursive: true });
    }

    const harLog: Log = {
      version: '1.2',
      creator: {
        version: '1.0.0',
        name: 'optic',
      },
      entries,
    };

    fs.writeFile(
      path.join(harOutputDir, `${now}.fastify-capture.har`),
      JSON.stringify({ log: harLog }, null, 2),
      function (err) {
        if (err) {
          console.error(`Failed to write HAR file to disk., ${err}`);
        }
      }
    );

    entries.length = 0;
  };

  return (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
    done: () => void
  ) => {
    if (
      options.sampleRate === 0 ||
      (options.sampleRate && Math.random() > options.sampleRate)
    )
      return done();

    const startTime = Date.now();
    const requestContentType = request.headers['content-type'] ?? '';
    const responseContentType = String(reply.getHeader('content-type') ?? '');
    const httpVersion = 'HTTP/' + request.raw.httpVersion;

    const href = request.protocol + '://' + request.headers.host + request.url;
    const url = new URL(href);

    const reqEntry: Entry = {
      timings: {
        send: -1,
        receive: -1,
        wait: -1,
      },
      startedDateTime: new Date(startTime).toISOString(),
      time: -1,
      request: {
        method: request.method,
        url: href,
        httpVersion,
        headers: buildHeaders(request.headers),
        cookies: buildRequestCookies(request.headers.cookie ?? ''),
        queryString: [...url.searchParams].map(([name, value]) => ({
          name,
          value,
        })),
        headersSize: -1,
        bodySize: -1,
      },
      response: {
        status: reply.statusCode,
        httpVersion,
        statusText: http.STATUS_CODES[reply.statusCode] ?? '',
        headers: buildHeaders(reply.getHeaders()),
        cookies: buildResponseCookies(
          formatSetCookiesHeader(reply.getHeader('set-cookie'))
        ),
        content: {
          size: -1,
          mimeType: responseContentType,
          text: String(payload ?? ''),
        },
        redirectURL: String(reply.getHeader('location') ?? ''),
        headersSize: -1,
        bodySize: -1,
      },
      cache: {},
    };

    if (requestContentType === 'application/x-www-form-urlencoded') {
      reqEntry.request.postData = {
        mimeType: requestContentType,
        params: Object.entries(
          typeof request.body === 'object'
            ? request.body ?? {}
            : JSON.stringify(request.body)
        ).map(([name, value]) => ({ name, value })),
      };
    } else {
      reqEntry.request.postData = {
        mimeType: requestContentType,
        text:
          typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body ?? ''),
      };
    }

    entries.push(reqEntry);
    save();
    done();
  };
};

function buildHeaders(headers: any) {
  const list: Header[] = [];
  Object.keys(headers).forEach((name) => {
    const values = Array.isArray(headers[name])
      ? headers[name]
      : [headers[name]];
    for (const value of values) {
      list.push({ name, value });
    }
  });
  return list;
}

function buildRequestCookies(cookieString: string) {
  const cookies: Cookie[] = [];
  for (const cookie of cookieString.split(';')) {
    const parsed = cookieParser.parse(cookie);
    for (const name in parsed) {
      const value = parsed[name];
      cookies.push({ name, value });
    }
  }
  return cookies;
}

function formatSetCookiesHeader(
  setCookiesHeader: string | number | string[] | undefined
): string | string[] {
  return typeof setCookiesHeader === 'string'
    ? setCookiesHeader
    : Array.isArray(setCookiesHeader)
      ? setCookiesHeader
      : String(setCookiesHeader ?? '');
}

function buildResponseCookies(setCookies: string | string[]) {
  const cookies: Cookie[] = [];
  let parsed: setCookieParser.Cookie[];
  try {
    parsed = setCookieParser.parse(setCookies);
  } catch (err) {
    return cookies;
  }
  for (const cookie of parsed) {
    const { name, value, path, domain, expires, httpOnly, secure } = cookie;
    const harCookie: Cookie = {
      name,
      value,
      httpOnly: httpOnly || false,
      secure: secure || false,
    };
    if (path) {
      harCookie.path = path;
    }
    if (domain) {
      harCookie.domain = domain;
    }
    if (expires) {
      harCookie.expires = expires.toISOString();
    }
    cookies.push(harCookie);
  }
  return cookies;
}
