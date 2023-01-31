import fetch, { Response } from 'node-fetch';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalError,
  ServiceUnavailableError,
} from './errors';

export class JsonHttpClient {
  // Create overridable this.fetch instance
  fetch: typeof fetch = fetch;
  source: string = 'client';

  private async verifyOkResponse(response: Response) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `expected a successful response. got ${response.status} ${response.statusText} \n${text}`
      );
    }
    return text;
  }

  private async handleJsonResponse(response: Response): Promise<any> {
    if (response.ok) {
      if (response.status === 204) {
        return;
      }
      const json = await response.json();
      return json;
    } else {
      const text = await response.text();
      const message = `${response.status} ${response.statusText} \n${text}`;
      const error =
        response.status === 400
          ? new BadRequestError(message, this.source)
          : response.status === 401
          ? new UnauthorizedError(message, this.source)
          : response.status === 403
          ? new ForbiddenError(message, this.source)
          : response.status === 404
          ? new NotFoundError(message, this.source)
          : response.status === 500
          ? new InternalError(message, this.source)
          : response.status === 503
          ? new ServiceUnavailableError(message, this.source)
          : new Error(message);

      throw error;
    }
  }

  async getJson<T = any>(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async getJsonWithoutHandlingResponse(url: string) {
    return this.fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async postJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'POST',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async postJson<T = any>(
    url: string,
    body: any,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.postJsonString<T>(url, JSON.stringify(body), additionalHeaders);
  }

  async patchJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'PATCH',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async patchJson<T = any>(
    url: string,
    body: any,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.patchJsonString<T>(
      url,
      JSON.stringify(body),
      additionalHeaders
    );
  }

  async postJsonWithoutBody<T = any>(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async getJsonAsText(url: string) {
    return this.fetch(url, {
      headers: {
        accept: 'application/json',
      },
    }).then(this.verifyOkResponse);
  }

  async putJson<T = any>(
    url: string,
    body: object,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.putJsonString<T>(url, JSON.stringify(body), additionalHeaders);
  }

  async putJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'PUT',
      body: body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async putBytes(
    url: string,
    body: Buffer,
    additionalHeaders: Record<string, string> = {}
  ) {
    return this.fetch(url, {
      method: 'PUT',
      body,
      headers: {
        'content-length': body.length.toString(),
        ...additionalHeaders,
      },
    }).then(this.verifyOkResponse);
  }
}
