import { JsonHttpClient } from '@useoptic/client-utilities';
import { ICreateCaptureRequest } from '@useoptic/saas-types';
import { developerDebugLogger } from './index';

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
    developerDebugLogger(`uploading batch to ${uploadUrl}`);
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'Content-Type': 'avro/optic-interactions-v1+binary',
      'x-amz-server-side-encryption': 'AES256',
    });
  }

  uploadSpec(uploadUrl: string, spec: any[]) {
    developerDebugLogger(`uploading spec to ${uploadUrl}`);
    const bytes = Buffer.from(JSON.stringify(spec));
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'Content-Type': 'application/json',
      'x-amz-server-side-encryption': 'AES256',
    });
  }

  startCapture(body: ICreateCaptureRequest) {
    const url = `${this.baseUrl}/captures`;
    return JsonHttpClient.postJson(url, body, this.defaultHeaders());
  }
}

export { Client };
