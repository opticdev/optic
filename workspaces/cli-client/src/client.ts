import {JsonHttpClient} from './json-http-client';
import {IOpticTaskRunnerConfig} from '@useoptic/cli-config';

class Client {
  constructor(private baseUrl: string) {
  }

  findSession(path: string, taskConfig: IOpticTaskRunnerConfig | null): Promise<{ session: { id: string } }> {
    const url = `${this.baseUrl}/sessions`;
    return JsonHttpClient.postJson(url, {path, taskConfig});
  }

  markCaptureAsCompleted(specId: string, captureId: string) {
    const url = `${this.baseUrl}/specs/${specId}/captures/${captureId}/status`;
    return JsonHttpClient.putJson(url, {status: 'completed'});
  }


  stopDaemon() {
    const url = `${this.baseUrl}/commands`;
    return JsonHttpClient.postJson(url, {type: 'shutdown'});
  }
}

export {
  Client
};
