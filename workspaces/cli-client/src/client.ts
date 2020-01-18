import {JsonHttpClient} from './json-http-client';
import {IOpticTaskRunnerConfig} from "@useoptic/cli-config";

class Client {
  constructor(private baseUrl: string) {
  }

  findSession(path: string, captureId: string): Promise<{ session: { id: string } }> {
    const url = `${this.baseUrl}/sessions`;
    return JsonHttpClient.postJson(url, {path, captureId});
  }

  postLastStart(task: IOpticTaskRunnerConfig): Promise<any> {
    const url = `${this.baseUrl}/last-start`;
    return JsonHttpClient.postJson(url, task);
  }

  stopDaemon() {
    const url = `${this.baseUrl}/commands`;
    return JsonHttpClient.postJson(url, {type: 'shutdown'});
  }
}

export {
  Client
};
