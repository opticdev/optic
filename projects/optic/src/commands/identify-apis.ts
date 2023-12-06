import { OpticCliConfig } from '../config';
import { logger } from '../logger';
import { loadRaw } from '../utils/spec-loaders';
import { OPTIC_URL_KEY } from '../constants';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import { getDetailsForGeneration } from '../utils/generated';
import path from 'path';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import * as Types from '../client/optic-backend-types';
import chunk from 'lodash.chunk';
import { getApiUrl } from '../utils/cloud-urls';

export async function identifyOrCreateApis(
  config: OpticCliConfig,
  localSpecPaths: string[],
  generatedDetails: Exclude<
    Awaited<ReturnType<typeof getDetailsForGeneration>>,
    null
  >,
  pathsToName: Record<string, string | null>
) {
  const { web_url, organization_id, default_branch, default_tag } =
    generatedDetails;

  const pathUrls = new Map<string, string>();

  for await (const specPath of localSpecPaths) {
    let rawSpec: OpenAPIV3.Document<{}>;

    try {
      rawSpec = await loadRaw(specPath, config);
    } catch (e) {
      logger.error('Error loading raw spec', e);
      continue; // TODO: handle failures
    }

    try {
      checkOpenAPIVersion(rawSpec);
    } catch (e) {
      logger.error('Error checking OpenAPI version', e);
      continue; // TODO: handle failures
    }

    const opticUrl = rawSpec[OPTIC_URL_KEY];
    const relativePath = path.relative(config.root, path.resolve(specPath));
    pathUrls.set(relativePath, opticUrl);
  }

  let apis: (Types.Api | null)[] = [];
  const chunks = chunk([...pathUrls.keys()], 20);
  for (const chunk of chunks) {
    const { apis: apiChunk } = await config.client.getApis(chunk, web_url);
    apis.push(...apiChunk);
  }

  for (const api of apis) {
    if (api) {
      pathUrls.set(
        api.path,
        getApiUrl(config.client.getWebBase(), api.organization_id, api.api_id)
      );
    }
  }

  for (let [path, url] of pathUrls.entries()) {
    if (!url) {
      const api = await config.client.createApi(organization_id, {
        name: pathsToName[path] ?? path,
        path,
        web_url: web_url,
        default_branch,
        default_tag,
      });
      const url = getApiUrl(
        config.client.getWebBase(),
        organization_id,
        api.id
      );
      pathUrls.set(path, url);
    }
  }

  return pathUrls;
}
