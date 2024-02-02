import fetch from 'node-fetch';
import { JsonHttpClient } from './JsonHttpClient';
import * as Types from './optic-backend-types';

export class OpticBackendClient extends JsonHttpClient {
  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string>
  ) {
    super();
    this.source = 'optic';
  }

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

  public getWebBase(): string {
    return process.env.OPTIC_ENV === 'staging'
      ? 'https://app.o3c.info'
      : process.env.OPTIC_ENV === 'local'
        ? 'http://localhost:3001'
        : 'https://app.useoptic.com';
  }

  public getTokenOrgs(): Promise<{
    organizations: { id: string; name: string }[];
  }> {
    return this.getJson(`/api/token/orgs`);
  }

  public async createCapture(
    data:
      | {
          run_id: string;
          organization_id: string;
          success: true;
          unmatched_interactions: number;
          total_interactions: number;
          percent_covered: number;
          endpoints_added: number;
          endpoints_matched: number;
          endpoints_unmatched: number;
          endpoints_total: number;
          has_any_diffs: boolean;
          mismatched_endpoints: number;
        }
      | {
          success: false;
        }
  ): Promise<{}> {
    return this.postJson(`/api/captures`, data);
  }

  public async createRuleset(
    organizationId: string,
    name: string,
    description: string,
    config_schema: any
  ): Promise<{
    id: string;
    slug: string;
    upload_url: string;
    ruleset_url: string;
  }> {
    return this.postJson(`/api/organizations/${organizationId}/rulesets`, {
      name,
      description,
      config_schema,
    });
  }

  public async patchRuleset(
    organizationId: string,
    rulesetId: string,
    uploaded: boolean
  ): Promise<void> {
    return this.patchJson(
      `/api/organizations/${organizationId}/rulesets/${rulesetId}`,
      {
        uploaded,
      }
    );
  }

  public async getManyRulesetsByName(rulesets: string[]): Promise<{
    rulesets: ({
      name: string;
      url: string;
      uploaded_at: string;
    } | null)[];
  }> {
    const encodedRulesets = rulesets
      .map((r) => encodeURIComponent(r))
      .join(',');
    return this.getJson(`/api/rulesets?rulesets=${encodedRulesets}`);
  }

  public async getStandard(
    rulesetConfigIdentifier: string
  ): Promise<Types.Standard> {
    const encodedIdentifier = encodeURIComponent(rulesetConfigIdentifier);
    return this.getJson(`/api/ruleset-configs/${encodedIdentifier}`);
  }

  public async createOrgStandard(
    organizationId: string,
    standard: Types.StandardConfig
  ): Promise<{ id: string; slug: string }> {
    return this.postJson<{ id: string; slug: string }>(
      `/api/organizations/${organizationId}/standards`,
      {
        config: { ruleset: standard },
      }
    );
  }

  public async getOrgStandards(
    organizationId: string
  ): Promise<Types.Standard[]> {
    const response = await this.getJson<{
      data: Types.Standard[];
    }>(`/api/organizations/${organizationId}/standards`);

    return response.data;
  }

  public async prepareSpecUpload(body: {
    api_id: string;
    spec_checksum: string;
    sourcemap_checksum: string;
  }): Promise<
    | {
        upload_id: string;
        spec_url: string;
        sourcemap_url: string;
      }
    | {
        spec_id: string;
      }
  > {
    return this.postJson(`/api/specs/prepare`, body);
  }

  public async getSpec(
    apiId: string,
    tag: string
  ): Promise<{
    id: string;
    specUrl: string | null;
    sourcemapUrl: string | null;
  }> {
    return this.getJson(`/api/apis/${apiId}/specs/tag:${tag}`);
  }

  public async createSpec(spec: {
    tags: string[];
    openapi_version: '3.0.x' | '3.1.x';
    upload_id: string;
    api_id: string;
    effective_at?: Date;
    git_name?: string;
    git_email?: string;
    commit_message?: string;
    forward_effective_at_to_tags?: boolean;
  }): Promise<{ id: string }> {
    return this.postJson(`/api/specs`, spec);
  }

  public async tagSpec(specId: string, tags: string[], effective_at?: Date) {
    return this.patchJson(`/api/specs/${specId}/tags`, {
      tags,
      effective_at,
    });
  }

  public async prepareRunUpload(body: {
    checksum: string;
    api_id: string;
  }): Promise<{ upload_id: string; check_results_url: string }> {
    return this.postJson(`/api/runs/prepare`, body);
  }

  public async createRun(run: {
    upload_id: string;
    api_id: string;
    from_spec_id: string;
    to_spec_id: string;
    ruleset: Types.StandardConfig;
    ci?: boolean;
  }): Promise<{ id: string }> {
    return this.postJson(`/api/runs2`, run);
  }

  public async getApis(
    paths: string[],
    web_url: string
  ): Promise<{ apis: (Types.Api | null)[] }> {
    return this.getJson<{ apis: (Types.Api | null)[] }>(
      `/api/apis?paths=${paths
        .map((p) => encodeURIComponent(p))
        .join(',')}&web_url=${encodeURIComponent(web_url)}`
    );
  }

  public async createApi(
    organizationId: string,
    opts: {
      name: string;
      path?: string;
      web_url?: string;
      default_branch: string;
      default_tag?: string;
    }
  ): Promise<{ id: string }> {
    return this.postJson(`/api/api`, {
      ...opts,
      organization_id: organizationId,
    });
  }

  public async prepareVerification(specId: string, checksum: string) {
    return this.postJson<{
      upload_id: string;
      url: string;
    }>(`/api/verifications/prepare`, {
      spec_id: specId,
      checksum,
    });
  }

  public async createVerification(opts: {
    spec_id: string;
    upload_id: string;
    message?: string;
    run_id?: string;
  }) {
    return this.postJson<{ id: string }>(`/api/verifications`, {
      ...opts,
    });
  }

  public async verifyToken(): Promise<{
    user?: { email: string; userId: string };
    organization?: { organizationId: string };
  }> {
    return this.getJson(`/api/token/verify`);
  }

  public async getLintgptPreps(rule_checksums: string[]) {
    return this.postJson(`/api/lintgpt-preps/list`, { rule_checksums });
  }

  public async requestLintgptPreps(rules: string[]) {
    return this.postJson(`/api/lintgpt-preps/create`, { rules });
  }

  public async getLintgptEvals(
    evals: { rule_checksum: string; node_checksum: string }[]
  ) {
    return this.postJson(`/api/lintgpt-evals/list`, { evals });
  }

  public async requestLintgptEvals(
    eval_requests: {
      node: string;
      node_before?: string;
      location_context: string;
      rule_checksum: string;
    }[]
  ) {
    return this.postJson(`/api/lintgpt-evals/create`, { eval_requests });
  }
}

export const createOpticClient = (opticToken: string) => {
  const hostOverride = process.env.BWTS_HOST_OVERRIDE;
  const backendWebBase = hostOverride
    ? hostOverride
    : process.env.OPTIC_ENV === 'staging'
      ? 'https://api.o3c.info'
      : process.env.OPTIC_ENV === 'local'
        ? 'http://127.0.0.1:3030'
        : 'https://api.useoptic.com';

  const opticClient = new OpticBackendClient(backendWebBase, () =>
    Promise.resolve(opticToken)
  );
  return opticClient;
};

export const anonymizeUserToken = (token: string) =>
  token.slice(4).split('.')[0];
export const anonymizeOrgToken = (token: string) => token.split('.')[0];
