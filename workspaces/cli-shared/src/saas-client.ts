import {JsonHttpClient} from '@useoptic/client-utilities';

class Client {
  private readonly defaultAdditionalHeaders: Record<string, string>;

  constructor(private baseUrl: string, private launchToken: string) {
    //@TODO make this actually a jwt
    console.log({launchToken});
    this.defaultAdditionalHeaders = {Authorization: `Bearer ${this.launchToken}`};
  }

  async getSpecUploadUrl() {
    const url = `${this.baseUrl}/spec-uploads`;
    console.log({url});
    return JsonHttpClient.postJsonWithoutBody(url, this.defaultAdditionalHeaders);
  }

  async getCaptureUploadUrl(agentId: string, batchId: string) {
    const url = `${this.baseUrl}/capture-uploads/agents/${agentId}/batches/${batchId}`;
    return JsonHttpClient.postJsonWithoutBody(url, this.defaultAdditionalHeaders);
  }

  uploadCapture(uploadUrl: string, bytes: Buffer) {
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'avro/optic-capture-v1+binary',
    });
  }

  uploadSpec(uploadUrl: string, spec: any[]) {
    const bytes = Buffer.from(JSON.stringify(spec));
    return JsonHttpClient.putBytes(uploadUrl, bytes, {
      'content-type': 'application/json'
    });
  }
}

export {
  Client
};
