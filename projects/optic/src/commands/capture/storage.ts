import crypto from 'crypto';
import fs from 'node:fs/promises';
import fsNonPromise from 'fs';
import os from 'os';
import path from 'path';
import { Writable } from 'stream';

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

export async function getCaptureStreams(
  trafficDir: string,
  endpoints: string[]
): Promise<Map<string, { stream: Writable; path: string }>> {
  const streams = new Map<string, { stream: Writable; path: string }>();
  for (const endpoint of endpoints) {
    const endpointHash = crypto
      .createHash('md5')
      .update(endpoint)
      .digest('hex');
    const fPath = path.join(trafficDir, `${endpointHash}.incomplete`);
    streams.set(endpoint, {
      stream: fsNonPromise.createWriteStream(fPath),
      path: fPath,
    });
  }
  const unmatched = path.join(trafficDir, `unmatched.incomplete`);
  streams.set(UNMATCHED_PATH, {
    stream: fsNonPromise.createWriteStream(unmatched),
    path: unmatched,
  });

  return streams;
}
