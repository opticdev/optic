import { ITestingService, Result, Capture, ok } from '.';
import UrlJoin from 'url-join';

// TODO: implement ITestingService
export class TestingService {
  private authToken: string;
  private refreshing?: Promise<unknown>;

  constructor(
    private fetchAuthToken: () => PromiseLike<Response>,
    private baseUrl: string
  ) {
    this.refreshAuth();
  }

  private async callApi(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers || {});
    const { authToken } = this;

    const url = UrlJoin(this.baseUrl, path);

    if (!authToken) {
      await this.refreshAuth();
    }

    headers.set('Authorization', `Bearer ${this.authToken}`);

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok && response.status === 401) {
      this.refreshAuth(); // trigger refreshing of auth after an Unauthorized, but don't wait on it or retry for now
    }

    return response;
  }

  private async refreshAuth() {
    if (!this.refreshing) {
      const refresh = async () => {
        const response = await this.fetchAuthToken();

        if (!response.ok)
          throw new Error(
            'Could not fetch testing credentials required to use TestingService'
          );

        const payload = await response.json();
        if (!payload.authToken)
          throw new Error(
            'Could not fetch usable testing credentials to use Testing Service'
          );

        this.authToken = payload.authToken;
        this.refreshing = null;
      };
      // only refresh auth once, no matter how many endpoints are waiting
      this.refreshing = refresh();
    }

    return this.refreshing;
  }

  async listCaptures(): Promise<Result<Capture[]>> {
    const response = await this.callApi('/captures');

    if (!response.ok) throw new Error('List of captures could not be fetched');

    const payload = await response.json();

    return ok(payload.captures);
  }
}
