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
  runId: string
): string {
  return urljoin(baseUrl, `organizations/${orgId}/runs/${runId}`);
}

export function getSpecUrl(
  baseUrl: string,
  orgId: string,
  specId: string
): string {
  return urljoin(baseUrl, `organizations/${orgId}/specs/${specId}`);
}

export function getStandardsUrl(
  baseUrl: string,
  orgId: string,
  standardId: string
) {
  return urljoin(baseUrl, `organizations/${orgId}/standards/${standardId}`);
}
