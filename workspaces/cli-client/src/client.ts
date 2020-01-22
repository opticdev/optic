import {JsonHttpClient} from './json-http-client';
import {IOpticTaskRunnerConfig} from '@useoptic/cli-config';

class Client {
  constructor(private baseUrl: string) {
  }

  findSession(path: string, taskConfig: IOpticTaskRunnerConfig | null): Promise<{ session: { id: string } }> {
    const url = `${this.baseUrl}/sessions`;
    return JsonHttpClient.postJson(url, {path, taskConfig});
  }

  stopDaemon() {
    const url = `${this.baseUrl}/commands`;
    return JsonHttpClient.postJson(url, {type: 'shutdown'});
  }
}

export {
  Client
};
