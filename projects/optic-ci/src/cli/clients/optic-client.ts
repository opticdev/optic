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
  status: 'completed' | 'started' | 'noop' | 'error';
  metadata?: any;
};

export enum UploadSlot {
  FromFile = 'FromFile',
  ToFile = 'ToFile',
  CheckResults = 'CheckResults',
  FromSourceMap = 'FromSourceMap',
  ToSourceMap = 'ToSourceMap',
}

export enum LegacyUploadSlot {
  FromFile = 'FromFile',
  ToFile = 'ToFile',
  CheckResults = 'CheckResults',
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

export enum SessionStatus {
  Ready = 'ready',
  NotReady = 'not_ready',
}

export type GetSessionResponse = {
  web_url: string;
  session: Session;
  status: SessionStatus;
  files: SessionFile[];
};

export type GetSessionStatusResponse = {
  status: Session['status'];
  metadata: {
    polling_wait_time: number;
  };
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

  public async createSession(session: {
    owner: string;
    repo: string;
    commit_hash: string;
    pull_request: number;
    run: number;
    branch_name: string;
    from_arg: string | null;
    to_arg: string | null;
    status?: 'started' | 'completed';
    spec_id?: string;
  }): Promise<string> {
    const { id: sessionId } = await this.postJson(`/api/runs`, {
      ...session,
    });
    return sessionId;
  }

  public async startSession(sessionId: string): Promise<void> {
    await this.postJson(`/api/runs/${sessionId}/start`, {});
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

  public async getSessionStatus(
    sessionId: string
  ): Promise<GetSessionStatusResponse> {
    return this.getJson<GetSessionStatusResponse>(
      `/api/runs/${sessionId}/status`
    );
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
