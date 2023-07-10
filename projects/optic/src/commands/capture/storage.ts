import crypto from 'crypto';
import fs from 'node:fs/promises';
import os from 'os';
import path from 'path';
import { HttpArchive } from '../oas/captures';
import { OperationQueries } from '../oas/operations/queries';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getEndpointId } from '../../utils/id';

const tmpDirectory = os.tmpdir();

export const UNMATCHED_PATH = 'unmatched';

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
  private paths: Map<string, { path: string; hars: HttpArchive.Entry[] }>;
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
      });
    }

    const unmatched = path.join(trafficDir, `unmatched.har`);
    this.paths.set(UNMATCHED_PATH, {
      path: unmatched,
      hars: [],
    });
  }

  addHar(har: HttpArchive.Entry) {
    const opRes = this.queries.findOperation(
      har.request.url,
      har.request.method
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
      this.paths.get(UNMATCHED_PATH)!.hars.push(har);
    } else {
      pathNode.hars.push(har);
    }
  }

  async writeHarFiles(): Promise<void> {
    for (const [, file] of this.paths) {
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
}
