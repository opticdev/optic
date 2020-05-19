import fetch from 'cross-fetch';

class JsonHttpClient {
  static async verifyOkResponse(response: Response) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `expected a successful response. got ${response.status} ${response.statusText} \n${text}`
      );
    }
    return text;
  }

  static async handleJsonResponse(response: Response) {
    if (response.ok) {
      if (response.status === 204) {
        return;
      }
      const json = await response.json();
      return json;
    } else {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText} \n${text}`);
    }
  }

  static getJson(url: string, additionalHeaders: Record<string, string> = {}) {
    return fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(JsonHttpClient.handleJsonResponse);
  }

  static getJsonWithoutHandlingResponse(url: string) {
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  static postJsonString(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ) {
    return fetch(url, {
      method: 'POST',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(JsonHttpClient.handleJsonResponse);
  }

  static postJson(
    url: string,
    body: any,
    additionalHeaders: Record<string, string> = {}
  ) {
    return JsonHttpClient.postJsonString(
      url,
      JSON.stringify(body),
      additionalHeaders
    );
  }

  static postJsonWithoutBody(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ) {
    return fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(JsonHttpClient.handleJsonResponse);
  }

  static getJsonAsText(url: string) {
    return fetch(url, {
      headers: {
        accept: 'application/json',
      },
    }).then(JsonHttpClient.verifyOkResponse);
  }

  static putJson(
    url: string,
    body: object,
    additionalHeaders: Record<string, string> = {}
  ) {
    return JsonHttpClient.putJsonString(
      url,
      JSON.stringify(body),
      additionalHeaders
    );
  }

  static putJsonString(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ) {
    return fetch(url, {
      method: 'PUT',
      body: body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(JsonHttpClient.handleJsonResponse);
  }

  static putBytes(
    url: string,
    body: Buffer,
    additionalHeaders: Record<string, string> = {}
  ) {
    return fetch(url, {
      method: 'PUT',
      body,
      headers: {
        'content-length': body.length.toString(),
        ...additionalHeaders,
      },
    }).then(JsonHttpClient.verifyOkResponse);
  }
}

export { JsonHttpClient };
