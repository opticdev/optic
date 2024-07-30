import fetch from 'node-fetch';
import { JsonHttpClient } from './JsonHttpClient';

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
