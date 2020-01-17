import {JsonHttpClient} from './json-http-client';

class Client {
  constructor(private baseUrl: string) {
  }

  findSession(path: string, captureId: string): Promise<{ session: { id: string } }> {
    const url = `${this.baseUrl}/sessions`;
    return JsonHttpClient.postJson(url, {path, captureId});
  }

  stopDaemon() {
    const url = `${this.baseUrl}/commands`;
    return JsonHttpClient.postJson(url, {type: 'shutdown'});
  }
}

export {
  Client
};
