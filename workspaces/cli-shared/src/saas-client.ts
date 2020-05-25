import { JsonHttpClient } from '@useoptic/client-utilities';

class Client {
  private readonly defaultAdditionalHeaders: Record<string, string>;

  constructor(private baseUrl: string, private readonly authToken?: string) {
    this.defaultAdditionalHeaders = {};
  }

  private defaultHeaders({ auth = true } = {}) {
    const headers = { ...this.defaultAdditionalHeaders };

    if (auth) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async getSpecUploadUrl() {
    const url = `${this.baseUrl}/spec-uploads`;
    return JsonHttpClient.postJsonWithoutBody(url, this.defaultHeaders());
  }

  async getCaptureUploadUrl(agentId: string, batchId: string) {
    const url = `${this.baseUrl}/capture-uploads/agents/${agentId}/batches/${batchId}`;
    return JsonHttpClient.postJsonWithoutBody(url, this.defaultHeaders());
  }

  uploadCapture(uploadUrl: string, bytes: Buffer) {
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'avro/optic-capture-v1+binary',
    });
  }

  uploadSpec(uploadUrl: string, spec: any[]) {
    const bytes = Buffer.from(JSON.stringify(spec));
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'application/json',
    });
  }
}

export { Client };
