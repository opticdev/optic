import fetch from 'node-fetch';
import { JsonHttpClient } from './JsonHttpClient';
// TODO created shared instance to import from (optic cloud fe + here)

type Session = {
  owner: string;
  repo: string;
  commit_hash: string;
  pull_request: number;
  run: number;
  branch_name: string;
  from_arg: string | null;
  to_arg: string | null;
};

export enum UploadSlot {
  FromFile = 'FromFile',
  ToFile = 'ToFile',
  CheckResults = 'CheckResults',
  FromSourceMap = 'FromSourceMap',
  ToSourceMap = 'ToSourceMap',
}

export type UploadUrl = {
  id: string;
  slot: UploadSlot;
  url: string;
};

type SessionFile = {
  slot: UploadSlot;
  url: string;
};

type GetSessionResponse = {
  web_url: string;
  session: Session;
  status: 'ready' | 'not_ready';
  files: SessionFile[];
};

type GetMyOrganizationResponse = {
  id: string;
  name: string;
  git_api_url: string;
  git_web_url: string;
  git_provider: string;
};

export class OpticBackendClient extends JsonHttpClient {
  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string>
  ) {
    super();
  }

  // TODO - fix this typing - node-fetch has isRedirect on the fn object
  // @ts-ignore
  fetch: typeof fetch = async (requestUri, options = {}) => {
    const token = await this.getAuthToken();
    const headers = options.headers || {};

    return fetch(`${this.baseUrl}${requestUri}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Token ${token}`,
      },
    });
  };

  public async getUploadUrls(
    sessionId: string,
    slots: UploadSlot[] = []
  ): Promise<UploadUrl[]> {
    let params = '';
    if (slots.length > 0) {
      params = '?' + new URLSearchParams({ slots: slots.join(',') }).toString();
    }

    const response = await this.getJson<{
      upload_urls: UploadUrl[];
    }>(`/api/runs/${sessionId}/uploads${params}`);
    return response.upload_urls;
  }

  public async startSession(session: Session): Promise<string> {
    const { id: sessionId } = await this.postJson(`/api/runs`, {
      ...session,
    });
    return sessionId;
  }

  public async markUploadAsComplete(
    sessionId: string,
    uploadId: string
  ): Promise<void> {
    await this.patchJson(`/api/runs/${sessionId}/uploads/${uploadId}`, {
      status: 'Unverified',
    });
  }

  public async getSession(sessionId: string): Promise<GetSessionResponse> {
    return this.getJson<GetSessionResponse>(`/api/runs/${sessionId}`);
  }

  public async getMyOrganization(): Promise<GetMyOrganizationResponse> {
    return this.getJson<GetMyOrganizationResponse>(`/api/my-organization`);
  }
}

export const createOpticClient = (opticToken: string) => {
  const backendWebBase =
    process.env.OPTIC_ENV === 'staging'
      ? 'https://api.o3c.info'
      : 'https://api.useoptic.com';

  const opticClient = new OpticBackendClient(backendWebBase, () =>
    Promise.resolve(opticToken)
  );
  return opticClient;
};
