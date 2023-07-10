import fetch from 'node-fetch';
import urljoin from 'url-join';

import { JsonHttpClient } from './JsonHttpClient';

export class GitlabClient extends JsonHttpClient {
  constructor(
    private baseUrl: string,
    private authToken: string
  ) {
    super();
  }

  // TODO - fix this typing - node-fetch has isRedirect on the fn object
  // @ts-ignore
  fetch: typeof fetch = async (requestUri: string, options = {}) => {
    const headers = options.headers || {};

    return fetch(urljoin(this.baseUrl, requestUri), {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.authToken}`,
      },
    });
  };

  // project path is a url-encoded combination of namespace + project name
  // https://docs.gitlab.com/ee/api/index.html#namespaced-path-encoding
  public async createMergeRequestComment(
    projectPath: string,
    mergeRequestIid: number,
    body: string
  ): Promise<void> {
    await this.postJson(
      `/v4/projects/${projectPath}/merge_requests/${mergeRequestIid}/notes`,
      {
        body,
      }
    );
  }

  public async updateMergeRequestComment(
    projectPath: string,
    mergeRequestIid: number,
    noteId: number,
    body: string
  ): Promise<void> {
    await this.putJson(
      `/v4/projects/${projectPath}/merge_requests/${mergeRequestIid}/notes/${noteId}`,
      {
        body,
      }
    );
  }

  public async listMergeRequestComment(
    projectPath: string,
    mergeRequestIid: number
  ): Promise<
    {
      id: number;
      body: string;
    }[]
  > {
    return this.getJson(
      `/v4/projects/${projectPath}/merge_requests/${mergeRequestIid}/notes`
    );
  }

  public async listMergeRequestReviewers(
    projectPath: string,
    mergeRequestIid: number
  ): Promise<
    {
      id: number;
      name: string;
      username: string;
      state: string;
      avatar_url: string;
      web_url: string;
    }[]
  > {
    const response = await this.getJson(
      `/v4/projects/${projectPath}/merge_requests/${mergeRequestIid}`
    );
    return response.reviewers;
  }
}
