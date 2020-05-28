import { JsonHttpClient } from '@useoptic/client-utilities';
import { ICreateCaptureRequest } from '@useoptic/saas-types';

class Client {
  private readonly defaultAdditionalHeaders: Record<string, string>;

  constructor(private baseUrl: string, private authToken?: string) {
    this.defaultAdditionalHeaders = {};
  }

  private defaultHeaders({ auth = true } = {}) {
    const headers = { ...this.defaultAdditionalHeaders };

    if (auth) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async getApiAuthToken(apiName: string) {
    const url = `${this.baseUrl}/registrations`;
    const body = {
      apiName,
    };

    const response = await JsonHttpClient.postJson(url, body);
    return response.token;
  }

  async getSpecUploadUrl() {
    const url = `${this.baseUrl}/spec-uploads`;
    return JsonHttpClient.postJsonWithoutBody(url, this.defaultHeaders());
  }

  async getInteractionsUploadUrl(agentId: string, batchId: string) {
    const url = `${this.baseUrl}/interaction-uploads`;
    return JsonHttpClient.postJson(
      url,
      { agentId, batchId },
      this.defaultHeaders()
    );
  }

  uploadInteractions(uploadUrl: string, bytes: Buffer) {
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'avro/optic-interactions-v1+binary',
    });
  }

  uploadSpec(uploadUrl: string, spec: any[]) {
    const bytes = Buffer.from(JSON.stringify(spec));
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'application/json',
    });
  }

  startCapture(body: ICreateCaptureRequest) {
    const url = `${this.baseUrl}/captures`;
    return JsonHttpClient.postJson(url, body);
  }
}

export { Client };
