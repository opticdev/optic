import {
  ITestingService,
  Capture,
  CoverageReport,
  Result,
  ok,
  err,
  NotFoundError,
  RfcEventStream,
  UndocumentedEndpoint,
} from '.';
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
      ...options,
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

  async loadCapture(captureId): Promise<Result<Capture, NotFoundError>> {
    const response = await this.callApi(`/captures/${captureId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return err(new NotFoundError());
      } else {
        throw new Error('Capture could not be fetched');
      }
    }

    const payload = await response.json();

    return ok(payload);
  }

  async loadReport(captureId): Promise<Result<CoverageReport, NotFoundError>> {
    const response = await this.callApi(
      `/captures/${captureId}/reports/coverage`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return err(new NotFoundError());
      } else {
        throw new Error('CoverageReport for capture could not be fetched');
      }
    }

    const payload = await response.json();

    return ok(payload);
  }

  async loadUndocumentedEndpoints(
    captureId
  ): Promise<Result<UndocumentedEndpoint[], NotFoundError>> {
    const response = await this.callApi(
      `/captures/${captureId}/reports/undocumented-urls`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return err(new NotFoundError());
      } else {
        throw new Error(
          'Undocumented endpoints for capture could not be fetched'
        );
      }
    }

    const payload = await response.json();
    return ok(payload);
  }

  async loadSpecEvents(
    captureId
  ): Promise<Result<RfcEventStream, NotFoundError>> {
    const response = await this.callApi(`/captures/${captureId}/spec`);

    if (!response.ok) {
      if (response.status === 404) {
        return err(new NotFoundError());
      } else {
        throw new Error('Spec for capture could not be fetched');
      }
    }

    const payload = await response.json();

    return ok(payload);
  }
}
