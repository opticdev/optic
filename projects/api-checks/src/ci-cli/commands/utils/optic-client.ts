import { v4 as uuidv4 } from 'uuid';
import fetch, { Response } from 'node-fetch';
// TODO created shared instance to import from (optic cloud fe + here)

class JsonHttpClient {
  // Create overridable this.fetch instance
  fetch: typeof fetch = fetch;

  private async verifyOkResponse(response: Response) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `expected a successful response. got ${response.status} ${response.statusText} \n${text}`
      );
    }
    return text;
  }

  private async handleJsonResponse(response: Response): Promise<any> {
    if (response.ok) {
      if (response.status === 204) {
        return;
      }
      const json = await response.json();
      return json;
    } else {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText} \n${text}`);
    }
  }

  async getJson<T = any>(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async getJsonWithoutHandlingResponse(url: string) {
    return this.fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async postJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'POST',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async postJson<T = any>(
    url: string,
    body: any,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.postJsonString<T>(url, JSON.stringify(body), additionalHeaders);
  }

  async patchJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'PATCH',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async patchJson<T = any>(
    url: string,
    body: any,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.patchJsonString<T>(
      url,
      JSON.stringify(body),
      additionalHeaders
    );
  }

  async postJsonWithoutBody<T = any>(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async getJsonAsText(url: string) {
    return this.fetch(url, {
      headers: {
        accept: 'application/json',
      },
    }).then(this.verifyOkResponse);
  }

  async putJson<T = any>(
    url: string,
    body: object,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.putJsonString<T>(url, JSON.stringify(body), additionalHeaders);
  }

  async putJsonString<T = any>(
    url: string,
    body: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    return this.fetch(url, {
      method: 'PUT',
      body: body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...additionalHeaders,
      },
    }).then(this.handleJsonResponse);
  }

  async putBytes(
    url: string,
    body: Buffer,
    additionalHeaders: Record<string, string> = {}
  ) {
    return this.fetch(url, {
      method: 'PUT',
      body,
      headers: {
        'content-length': body.length.toString(),
        ...additionalHeaders,
      },
    }).then(this.verifyOkResponse);
  }
}

export enum SessionType {
  GithubActions = 'GithubActions',
  CircleCi = 'CircleCi',
}

export type UploadRunArgs = {
  from: string;
  provider: 'github' | 'circleci';
  to: string;
  context: string;
  rules: string;
};

type Session =
  | {
      type: SessionType.GithubActions;
      data: {
        run_args: UploadRunArgs;
        github_data: {
          organization: string;
          repo: string;
          commit_hash: string;
          pull_request: number;
          run: number;
        };
      };
    }
  | {
      type: SessionType.CircleCi;
      data: {
        run_args: UploadRunArgs;
        circle_ci_data: {
          organization: string;
          repo: string;
          commit_hash: string;
          pull_request: number;
          run: number;
        };
      };
    };

export enum UploadSlot {
  FromFile = 'FromFile',
  ToFile = 'ToFile',
  GithubActionsEvent = 'GithubActionsEvent',
  CircleCiEvent = 'CircleCiEvent',
  CheckResults = 'CheckResults',
}

export type UploadUrl = {
  id: string;
  slot: UploadSlot;
  url: string;
};

export enum SessionStatus {
  Ready = 'Ready',
  NotReady = 'NotReady',
}

type SessionFile = {
  slot: UploadSlot;
  url: string;
};

type GetSessionResponse = {
  web_url: string;
  session: Session;
  status: SessionStatus;
  files: SessionFile[];
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

  public async getUploadUrls(sessionId: string): Promise<UploadUrl[]> {
    const response = await this.getJson<{
      upload_urls: UploadUrl[];
    }>(`/api/runs/${sessionId}/upload-urls`);
    return response.upload_urls;
  }

  public async startSession<Type extends SessionType>(
    sessionType: Type,
    sessionData: Extract<Session, { type: Type }>['data']
  ): Promise<string> {
    const sessionId = uuidv4();

    await this.postJson(
      `/api/spec-comparison-sessions/${sessionId}/commands/start-session`,
      {
        session: {
          type: sessionType,
          data: {
            ...sessionData,
          },
        },
      }
    );
    return sessionId;
  }

  public async markUploadAsComplete(
    sessionId: string,
    uploadId: string,
    uploadSlot: UploadSlot
  ): Promise<void> {
    await this.postJson(
      `/api/spec-comparison-sessions/${sessionId}/commands/mark-upload-completed`,
      {
        upload_id: uploadId,
        upload_slot: uploadSlot,
      }
    );
  }

  public async getSession(sessionId: string): Promise<GetSessionResponse> {
    return this.getJson<GetSessionResponse>(`/api/runs/${sessionId}`);
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
