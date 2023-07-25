import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import crypto from 'crypto';
import fs from 'node:fs/promises';
import path from 'path';

import {
  CapturedInteraction,
  CapturedInteractions,
} from '../sources/captured-interactions';
import { HttpArchive } from '../sources/har';
import { OperationQueries, specToOperations } from '../operations/queries';
import { getEndpointId } from '../../../utils/id';
import { logger } from '../../../logger';

export async function* handleServerPathPrefix(
  interactions: CapturedInteractions,
  spec: OpenAPIV3.Document
): CapturedInteractions {
  const hostBaseMap: { [key: string]: string } = {};

  spec.servers?.forEach((server) => {
    try {
      // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
      const parsed = new URL(server.url);

      const pathName = parsed.pathname;
      // remove trailing slash
      if (pathName.endsWith('/') && pathName.length > 1) {
        hostBaseMap[parsed.host] = pathName.substring(0, pathName.length - 1);
      } else {
        hostBaseMap[parsed.host] = pathName;
      }
    } catch (e) {}
  });

  for await (const interaction of interactions) {
    const host = interaction.request.host;
    if (hostBaseMap[host] && hostBaseMap[host] !== '/') {
      const base = hostBaseMap[host];
      if (interaction.request.path.startsWith(base)) {
        const adjustedPath =
          interaction.request.path === base
            ? '/'
            : interaction.request.path.replace(base, '');
        yield {
          ...interaction,
          request: {
            ...interaction.request,
            path: adjustedPath,
          },
        };
      } else {
        // Otherwise this is a request we should ignore since it doesn't match the base path for the hostBaseMap
        continue;
      }
    } else {
      yield interaction;
    }
  }
}

export class GroupedCaptures {
  // TODO - store interactions over hars - to do this:
  // - update capture interactions to be serializable (i.e. stop storing CapturedBody as a stream)
  // - build a read / write storage format for interactions
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
  constructor(
    trafficDir: string,
    private spec: OpenAPIV3.Document
  ) {
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
    const pathname = interaction.request.path;
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
      pathname = new URL(har.request.url).pathname;
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
    let matched = 0;
    for (const [, node] of this.paths) {
      total++;
      if (node.hars.length === 0 && node.interactions.length === 0) unmatched++;
      if (node.hars.length !== 0 || node.interactions.length !== 0) matched++;
    }

    return {
      total,
      unmatched,
      matched,
    };
  }

  unmatchedInteractionsCount(): number {
    return this.unmatched.hars.length + this.unmatched.interactions.length;
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
            this.getInteractionsIterator(node),
            this.spec
          ),
        };
      }
    }
  }

  getUndocumentedInteractions(): AsyncIterable<CapturedInteraction> {
    return handleServerPathPrefix(
      this.getInteractionsIterator(this.unmatched),
      this.spec
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
