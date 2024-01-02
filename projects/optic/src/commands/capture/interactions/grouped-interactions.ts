import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  OpenAPIV3,
  getEndpointId,
  getPathAndMethodFromEndpointId,
} from '@useoptic/openapi-utilities';
import crypto from 'crypto';
import fs from 'node:fs/promises';
import path from 'path';

import {
  CapturedInteraction,
  CapturedInteractions,
} from '../sources/captured-interactions';
import { HttpArchive } from '../sources/har';
import { OperationQueries, specToOperations } from '../operations/queries';
import { logger } from '../../../logger';
import { getIgnorePaths } from '../../../utils/specs';
import { minimatch } from 'minimatch';

export function createHostBaseMap(
  spec: OpenAPIV3.Document,
  options: {
    baseServerUrl?: string;
  } = {}
) {
  const hostBaseMap: { [key: string]: string } = {};
  const servers = spec.servers ?? [];
  if (options.baseServerUrl) servers.push({ url: options.baseServerUrl });

  servers.forEach((server) => {
    try {
      // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
      const parsed = new URL(server.url);

      const pathName = parsed.pathname;
      const pathWithoutTrailingSlash =
        pathName.endsWith('/') && pathName.length > 1
          ? pathName.substring(0, pathName.length - 1)
          : pathName;
      // Only overwrite if this host is more specific
      // This assumes only one path per hostname - if there's a case we need to handle more than one prefix per hostname we need to update this code
      if (
        !hostBaseMap[parsed.host] ||
        hostBaseMap[parsed.host].length < pathWithoutTrailingSlash.length
      ) {
        hostBaseMap[parsed.host] = pathWithoutTrailingSlash;
      }
    } catch (e) {}
  });
  return hostBaseMap;
}

function adjustPath(
  { path, method, host }: { path: string; host: string; method: string },
  hostBaseMap: { [key: string]: string },
  options: { silent?: boolean } = {}
): string | null {
  if (hostBaseMap[host] && hostBaseMap[host] !== '/') {
    const base = hostBaseMap[host];
    if (path.startsWith(base)) {
      const adjustedPath = path === base ? '/' : path.replace(base, '');
      return adjustedPath;
    } else {
      // Otherwise this is a request we should ignore since it doesn't match the base path for the hostBaseMap
      !options.silent &&
        logger.debug(
          `Skipping interaction ${path} ${method} because path does not start with the hostname base: ${base}`
        );
      return null;
    }
  }
  return path;
}

export async function* handleServerPathPrefix(
  interactions: CapturedInteractions,
  hostBaseMap: { [key: string]: string }
): CapturedInteractions {
  for await (const interaction of interactions) {
    const adjustedPath = adjustPath(interaction.request, hostBaseMap);
    if (adjustedPath) {
      const adjustedInteraction = {
        ...interaction,
        request: {
          ...interaction.request,
          path: adjustedPath,
        },
      };
      yield adjustedInteraction;
    }
  }
}

export async function* filterIgnoredInteractions(
  interactions: CapturedInteractions,
  spec: OpenAPIV3.Document
) {
  const ignorePaths = getIgnorePaths(spec);
  const methodMap: Map<string, Set<string>> = new Map(
    Object.values(OpenAPIV3.HttpMethods)
      .filter((method) => method !== 'options' && method !== 'head')
      .map((method) => [method, new Set()])
  );

  for (const ignore of ignorePaths) {
    if (ignore.method) {
      methodMap.get(ignore.method)?.add(ignore.path);
    } else {
      for (const [, ignoreSet] of methodMap) {
        ignoreSet.add(ignore.path);
      }
    }
  }

  for await (const interaction of interactions) {
    const ignorePaths = methodMap.get(interaction.request.method) ?? new Set();
    const ignoreMatch = [...ignorePaths.values()].find((p) =>
      minimatch(interaction.request.path, p)
    );
    if (ignoreMatch) {
      logger.debug(
        `Skipping interaction ${interaction.request.path} ${interaction.request.method} because path matched the ignore pattern ${ignoreMatch}`
      );
    } else {
      yield interaction;
    }
  }
}

export class GroupedCaptures {
  // TODO - store interactions over hars - to do this:
  // - update capture interactions to be serializable (i.e. stop storing CapturedBody as a stream)
  // - build a read / write storage format for interactions

  // TODO - if we want to store + use cached hars, we'll need to store the `hostBaseMap` (tbd) - this is sometimes specified in `serverOverride` or `server.url`
  // which tells the hars how we store it.
  private paths: Map<
    string,
    {
      path: string;
      hars: HttpArchive.Entry[];
      interactions: CapturedInteraction[];
      endpoint: { method: string; path: string };
    }
  >;
  public unmatched: {
    path: string;
    hars: HttpArchive.Entry[];
    interactions: CapturedInteraction[];
  };
  private queries: OperationQueries;
  private hostBaseMap: ReturnType<typeof createHostBaseMap>;
  constructor(
    trafficDir: string,
    private spec: OpenAPIV3.Document,
    options: {
      baseServerUrl?: string;
    } = {}
  ) {
    this.hostBaseMap = createHostBaseMap(spec, options);
    const endpoints: { path: string; method: string }[] = specToOperations(
      spec
    ).map((p) => ({
      ...p,
      path: p.pathPattern,
    }));
    this.queries = new OperationQueries(
      endpoints.map((e) => ({
        pathPattern: e.path,
        method: e.method,
        specPath: jsonPointerHelpers.compile(['paths', e.path, e.method]),
      }))
    );
    this.paths = new Map();
    for (const endpoint of endpoints) {
      const id = getEndpointId(endpoint);
      const endpointHash = crypto.createHash('md5').update(id).digest('hex');

      const fPath = path.join(trafficDir, `${endpointHash}.har`);

      this.paths.set(id, {
        path: fPath,
        hars: [],
        interactions: [],
        endpoint,
      });
    }

    const unmatched = path.join(trafficDir, `unmatched.har`);
    this.unmatched = {
      path: unmatched,
      hars: [],
      interactions: [],
    };
  }

  addInteraction(interaction: CapturedInteraction) {
    const pathname =
      adjustPath(interaction.request, this.hostBaseMap, { silent: true }) ??
      interaction.request.path;
    const opRes = this.queries.findOperation(
      pathname,
      interaction.request.method
    );
    const operation = opRes.ok && opRes.val.some ? opRes.val.val : null;
    const pathNode = operation
      ? this.paths.get(
          getEndpointId({
            method: operation.method,
            path: operation.pathPattern,
          })
        )
      : null;
    if (!pathNode) {
      this.unmatched.interactions.push(interaction);
    } else {
      pathNode.interactions.push(interaction);
    }
  }

  addHar(har: HttpArchive.Entry) {
    let pathname: string;
    try {
      const url = new URL(har.request.url);
      pathname =
        adjustPath(
          {
            method: har.request.method,
            path: url.pathname,
            host: url.host,
          },
          this.hostBaseMap,
          { silent: true }
        ) ?? url.pathname;
    } catch (e) {
      logger.debug(`Skipping har entry - invalid URL`);
      logger.debug(har);
      logger.debug(e);
      return;
    }
    const opRes = this.queries.findOperation(pathname, har.request.method);
    const operation = opRes.ok && opRes.val.some ? opRes.val.val : null;
    const pathNode = operation
      ? this.paths.get(
          getEndpointId({
            method: operation.method,
            path: operation.pathPattern,
          })
        )
      : null;
    if (!pathNode) {
      this.unmatched.hars.push(har);
    } else {
      pathNode.hars.push(har);
    }
  }

  async writeHarFiles(): Promise<void> {
    for (const file of [...this.paths.values(), this.unmatched]) {
      if (!file.hars.length) continue;
      const har = {
        log: {
          version: '1.3',
          creator: 'Optic capture command',
          entries: file.hars,
        },
      };
      await fs.writeFile(file.path, JSON.stringify(har));
    }
  }

  counts() {
    let total = 0;
    let unmatched = 0;
    const unmatchedPaths: { method: string; path: string }[] = [];
    const matchedPaths: { method: string; path: string }[] = [];
    let matched = 0;
    for (const [, node] of this.paths) {
      total++;
      if (node.hars.length === 0 && node.interactions.length === 0) {
        unmatched++;
        unmatchedPaths.push(node.endpoint);
      }
      if (node.hars.length !== 0 || node.interactions.length !== 0) {
        matched++;
        matchedPaths.push(node.endpoint);
      }
    }

    return {
      total,
      unmatched,
      matched,
      paths: {
        unmatched: unmatchedPaths,
        matched: matchedPaths,
      },
    };
  }

  interactionCount() {
    const unmatched =
      this.unmatched.hars.length + this.unmatched.interactions.length;
    let matched = 0;
    for (const [, node] of this.paths) {
      matched += node.hars.length + node.interactions.length;
    }
    const total = matched + unmatched;
    return {
      total,
      unmatched,
      matched,
    };
  }

  *getDocumentedEndpointInteractions(): Iterable<{
    endpoint: { path: string; method: string };
    interactions: AsyncIterable<CapturedInteraction>;
  }> {
    for (const [, node] of this.paths) {
      if (node.hars.length || node.interactions.length) {
        yield {
          endpoint: node.endpoint,
          interactions: handleServerPathPrefix(
            filterIgnoredInteractions(
              this.getInteractionsIterator(node),
              this.spec
            ),
            this.hostBaseMap
          ),
        };
      }
    }
  }

  getUndocumentedInteractions(): AsyncIterable<CapturedInteraction> {
    return handleServerPathPrefix(
      filterIgnoredInteractions(
        this.getInteractionsIterator(this.unmatched),
        this.spec
      ),
      this.hostBaseMap
    );
  }

  private async *getInteractionsIterator(node: {
    hars: HttpArchive.Entry[];
    interactions: CapturedInteraction[];
  }): AsyncIterable<CapturedInteraction> {
    for (const har of node.hars) {
      const interaction = CapturedInteraction.fromHarEntry(har);
      if (interaction) yield interaction;
    }
    for (const interaction of node.interactions) {
      yield interaction;
    }
  }
}
