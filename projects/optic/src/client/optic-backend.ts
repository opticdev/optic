import fetch from 'node-fetch';
import { JsonHttpClient } from './JsonHttpClient';
import * as Types from './optic-backend-types';

export class OpticBackendClient extends JsonHttpClient {
  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string>
  ) {
    super();
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
      ? 'http://localhost:3000'
      : 'https://app.useoptic.com';
  }

  public async createRuleset(
    name: string,
    description: string,
    config_schema: any
  ): Promise<{
    id: string;
    upload_url: string;
    ruleset_url: string;
  }> {
    return this.postJson(`/api/rulesets`, {
      name,
      description,
      config_schema,
    });
  }

  public async patchRuleset(
    rulesetId: string,
    uploaded: boolean
  ): Promise<void> {
    return this.patchJson(`/api/rulesets/${rulesetId}`, {
      uploaded,
    });
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
  ) {
    // TODO
  }

  public async getOrgStandards(
    organizationId: string
  ): Promise<Types.Standard[]> {
    // TODO
    return [];
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
        spec_id?: undefined;
      }
    | { spec_id: string }
  > {
    return this.postJson(`/api/specs/prepare`, body);
  }

  public async createSpec(spec: {
    tags: string[];
    upload_id: string;
    api_id: string;
  }): Promise<{ id: string }> {
    return this.postJson(`/api/specs`, spec);
  }

  public async prepareRunUpload(body: {
    checksum: string;
  }): Promise<{ upload_id: string; check_results_url: string }> {
    return this.postJson(`/api/runs/prepare`, body);
  }

  public async createRun(run: {
    upload_id: string;
    api_id: string;
    from_spec_id: string;
    to_spec_id: string;
    ruleset?: Types.StandardConfig;
  }): Promise<{ id: string }> {
    return this.postJson(`/api/runs2`, run);
  }

  public async createApi() {
    // TODO
  }
}

export const createOpticClient = (opticToken: string) => {
  const hostOverride = process.env.BWTS_HOST_OVERRIDE;
  const backendWebBase = hostOverride
    ? hostOverride
    : process.env.OPTIC_ENV === 'staging'
    ? 'https://api.o3c.info'
    : 'https://api.useoptic.com';

  const opticClient = new OpticBackendClient(backendWebBase, () =>
    Promise.resolve(opticToken)
  );
  return opticClient;
};
