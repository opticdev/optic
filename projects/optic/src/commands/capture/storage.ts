import crypto from 'crypto';
import fs from 'node:fs/promises';
import os from 'os';
import path from 'path';

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
