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
