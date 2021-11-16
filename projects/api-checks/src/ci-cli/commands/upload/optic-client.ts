// TODO created shared instance to import from (optic cloud fe + here)
// TODO figure out what the parameters we need are
export class OpticBackendClient {
  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string>
  ) {}

  private fetch: typeof fetch = async (requestUri, options = {}) => {
    const token = await this.getAuthToken();
    const headers = options.headers || {};

    return fetch(`${this.baseUrl}${requestUri}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  public async getUploadUrl(): Promise<string> {
    return "";
  }

  public async saveCiRun() {}
}
