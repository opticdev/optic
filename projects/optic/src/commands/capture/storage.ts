import crypto from 'crypto';
import fs from 'node:fs/promises';
import os from 'os';
import path from 'path';
import { CapturedInteraction } from './sources/captured-interactions';
import { HttpArchive } from './sources/har';
import { OperationQueries } from '../oas/operations/queries';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getEndpointId } from '../../utils/id';
import { logger } from '../../logger';

const tmpDirectory = os.tmpdir();

export async function getCaptureStorage(filePath: string): Promise<string> {
  const resolvedFilepath = path.resolve(filePath);

  const specPathHash = crypto
    .createHash('md5')
    .update(resolvedFilepath)
    .digest('hex');

  // TODO in the future we can reuse cached requests if paths are identical (maybe hash paths?)
  const trafficDirectory = path.join(
    tmpDirectory,
    'optic',
    'captures-v2',
    specPathHash,
    String(Date.now())
  );

  await fs.mkdir(trafficDirectory, { recursive: true });

  return trafficDirectory;
}

export class GroupedCaptures {
  private paths: Map<
    string,
    {
      path: string;
      hars: HttpArchive.Entry[];
      endpoint: { method: string; path: string };
    }
  >;
  public unmatched: { path: string; hars: HttpArchive.Entry[] };
  private queries: OperationQueries;
  constructor(
    trafficDir: string,
    endpoints: { path: string; method: string }[]
  ) {
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
        endpoint,
      });
    }

    const unmatched = path.join(trafficDir, `unmatched.har`);
    this.unmatched = {
      path: unmatched,
      hars: [],
    };
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
      if (node.hars.length === 0) unmatched++;
      if (node.hars.length !== 0) matched++;
    }

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
      if (node.hars.length) {
        yield {
          endpoint: node.endpoint,
          interactions: this.getInteractionsIterator(node.hars),
        };
      }
    }
  }

  getUndocumentedInteractions(): AsyncIterable<CapturedInteraction> {
    return this.getInteractionsIterator(this.unmatched.hars);
  }

  private async *getInteractionsIterator(
    hars: HttpArchive.Entry[]
  ): AsyncIterable<CapturedInteraction> {
    for (const har of hars) {
      const interaction = CapturedInteraction.fromHarEntry(har);
      if (interaction) yield interaction;
    }
  }
}
