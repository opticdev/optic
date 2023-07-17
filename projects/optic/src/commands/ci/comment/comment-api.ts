import { Octokit } from '@octokit/rest';
import urljoin from 'url-join';
import { JsonHttpClient } from '../../../client/JsonHttpClient';
import fetch from 'node-fetch';

export interface CommentApi {
  getComment: (
    commentIdentifier: string
  ) => Promise<{ id: string; body: string } | null>;
  updateComment: (commentId: string, body: string) => Promise<void>;
  createComment: (body: string) => Promise<void>;
}

export class GithubCommenter implements CommentApi {
  private octokit: Octokit;
  constructor(
    private options: {
      token: string;
      owner: string;
      repo: string;
      pullRequest: string;
      sha: string;
      enterpriseBaseUrl?: string;
    }
  ) {
    this.octokit = new Octokit({
      auth: options.token,
      baseUrl: options.enterpriseBaseUrl,
      request: { fetch },
    });
  }

  async getComment(
    commentIdentifier: string
  ): Promise<{ id: string; body: string } | null> {
    const PER_PAGE = 100;
    let page = 1;
    const comments: Awaited<
      ReturnType<typeof this.octokit.rest.issues.listComments>
    >['data'] = [];

    // Issues refer to top level comments in the PR
    const { data } = await this.octokit.rest.issues.listComments({
      owner: this.options.owner,
      repo: this.options.repo,
      issue_number: Number(this.options.pullRequest),
      per_page: PER_PAGE,
      page,
    });
    comments.push(...data);

    let moreData = data.length >= PER_PAGE;

    while (moreData) {
      page += 1;
      const { data } = await this.octokit.rest.issues.listComments({
        owner: this.options.owner,
        repo: this.options.repo,
        issue_number: Number(this.options.pullRequest),
        per_page: PER_PAGE,
        page,
      });
      moreData = data.length >= PER_PAGE;
      comments.push(...data);
    }

    const maybeComment =
      comments.find((comment) =>
        new RegExp(commentIdentifier).test(comment.body || '')
      ) || null;
    return maybeComment
      ? {
          body: maybeComment.body || '',
          id: String(maybeComment.id),
        }
      : null;
  }

  async updateComment(commentId: string, body: string): Promise<void> {
    await this.octokit.rest.issues.updateComment({
      owner: this.options.owner,
      repo: this.options.repo,
      comment_id: Number(commentId),
      body,
    });
  }

  async createComment(body: string): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: this.options.owner,
      repo: this.options.repo,
      issue_number: Number(this.options.pullRequest),
      body,
    });
  }
}

export class GitlabCommenter extends JsonHttpClient implements CommentApi {
  private baseUrl: string;
  constructor(
    private options: {
      token: string;
      projectId: string;
      mergeRequestId: string;
      sha: string;
      enterpriseBaseUrl?: string;
    }
  ) {
    super();
    this.baseUrl = options.enterpriseBaseUrl ?? 'https://gitlab.com';
  }

  async getComment(
    commentIdentifier: string
  ): Promise<{ id: string; body: string } | null> {
    const comments = await this.getJson<
      {
        id: number;
        body: string;
      }[]
    >(
      urljoin(
        this.baseUrl,
        `/api/v4/projects/${this.options.projectId}/merge_requests/${this.options.mergeRequestId}/notes`
      ),
      {
        Authorization: `Bearer ${this.options.token}`,
      }
    );
    const maybeComment =
      comments.find((comment) =>
        new RegExp(commentIdentifier).test(comment.body || '')
      ) || null;
    return maybeComment
      ? {
          body: maybeComment.body || '',
          id: String(maybeComment.id),
        }
      : null;
  }

  async updateComment(commentId: string, body: string): Promise<void> {
    await this.putJson(
      urljoin(
        this.baseUrl,
        `/api/v4/projects/${this.options.projectId}/merge_requests/${this.options.mergeRequestId}/notes/${commentId}`
      ),
      {
        body,
      },
      {
        Authorization: `Bearer ${this.options.token}`,
      }
    );
  }

  async createComment(body: string): Promise<void> {
    await this.postJson(
      urljoin(
        this.baseUrl,
        `/api/v4/projects/${this.options.projectId}/merge_requests/${this.options.mergeRequestId}/notes`
      ),
      {
        body,
      },
      {
        Authorization: `Bearer ${this.options.token}`,
      }
    );
  }
}
