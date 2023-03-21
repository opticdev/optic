import { url } from 'node:inspector';
import { URL } from 'node:url';
import urljoin from 'url-join';

// expected format: app.useoptic.com/organizations/:orgId/apis/:apiId
const PATH_NAME_REGEXP =
  /^\/organizations\/([a-zA-Z0-9-_]+)\/apis\/([a-zA-Z0-9-_]+)$/i;

export function getApiFromOpticUrl(
  opticUrl: string
): { apiId: string; orgId: string } | null {
  try {
    const url = new URL(opticUrl);
    const match = url.pathname.match(PATH_NAME_REGEXP);
    const maybeOrgId = match?.[1];
    const maybeApiId = match?.[2];
    return maybeOrgId && maybeApiId
      ? {
          apiId: maybeApiId,
          orgId: maybeOrgId,
        }
      : null;
  } catch (e) {
    return null;
  }
}

export function getApiUrl(
  baseUrl: string,
  orgId: string,
  apiId: string
): string {
  return urljoin(baseUrl, `organizations/${orgId}/apis/${apiId}`);
}

export function getRunUrl(
  baseUrl: string,
  orgId: string,
  apiId: string,
  runId: string
): string {
  return urljoin(baseUrl, `organizations/${orgId}/apis/${apiId}/runs/${runId}`);
}

export function getSpecUrl(
  baseUrl: string,
  orgId: string,
  apiId: string,
  specId: string
): string {
  return urljoin(
    baseUrl,
    `organizations/${orgId}/apis/${apiId}?specId=${specId}`
  );
}

export function getStandardsUrl(
  baseUrl: string,
  orgId: string,
  standardId: string
) {
  return urljoin(
    baseUrl,
    `organizations/${orgId}/settings/standards/${standardId}`
  );
}

export function getNewTokenUrl(baseUrl: string) {
  return urljoin(baseUrl, 'user-settings/personal-access-token/new');
}

export function getCiSetupUrl(
  baseUrl: string,
  provider?: string,
  web_url?: string
) {
  const url = new URL(urljoin(baseUrl, 'ci-setup'));
  if (provider) {
    url.searchParams.set('provider', provider);
  }

  if (web_url) {
    url.searchParams.set('web_url', web_url);
  }

  return url.toString();
}
