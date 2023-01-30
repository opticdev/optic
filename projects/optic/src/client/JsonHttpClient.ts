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
      const ErrorClass =
        response.statusText === '400'
          ? BadRequestError
          : response.statusText === '401'
          ? UnauthorizedError
          : response.statusText === '403'
          ? ForbiddenError
          : response.statusText === '404'
          ? NotFoundError
          : response.statusText === '500'
          ? InternalError
          : response.statusText === '503'
          ? ServiceUnavailableError
          : Error;
      throw new ErrorClass(message);
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
