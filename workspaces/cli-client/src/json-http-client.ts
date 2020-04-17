import fetch from 'cross-fetch';

class JsonHttpClient {
  static async handleJsonResponse(response: Response) {
    if (response.ok) {
      if (response.status === 204) {
        return;
      }
      const json = await response.json();
      return json;
    } else {
      const text = await response.text();
      throw new Error(text);
    }
  }

  static getJsonWithoutHandlingResponse(url: string) {
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
  }

  static postJson(url: string, body: object) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    })
      .then(JsonHttpClient.handleJsonResponse);
  }

  static putJson(url: string, body: object) {
    return fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    })
      .then(JsonHttpClient.handleJsonResponse);
  }
}

export {
  JsonHttpClient
};
