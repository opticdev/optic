import { URL } from 'node:url';

// expected format: app.useoptic.com/organizations/:orgId/apis/:apiId
const PATH_NAME_REGEXP =
  /^\/organizations\/[a-zA-Z0-9-_]+\/apis\/([a-zA-Z0-9-_]+)$/i;

export function getApiFromOpticUrl(opticUrl: string): string | null {
  try {
    const url = new URL(opticUrl);
    const match = url.pathname.match(PATH_NAME_REGEXP);
    const maybeApiId = match?.[1];
    return maybeApiId ?? null;
  } catch (e) {
    return null;
  }
}
