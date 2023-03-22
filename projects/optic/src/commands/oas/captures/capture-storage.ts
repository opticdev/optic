import Path from 'path';
import * as fs from 'fs-extra';
import os from 'os';
const tmpDirectory = os.tmpdir();
import crypto from 'crypto';

export async function captureStorage(
  filePath: string
): Promise<[boolean, string, number]> {
  const resolvedFilepath = Path.resolve(filePath);
  const openApiExists: boolean = await fs.pathExists(resolvedFilepath);

  const specPathHash = crypto
    .createHash('md5')
    .update(resolvedFilepath)
    .digest('hex');

  const trafficDirectory = Path.join(
    tmpDirectory,
    'optic',
    'captures',
    specPathHash
  );

  if (openApiExists) await fs.ensureDir(trafficDirectory);

  return [
    openApiExists,
    trafficDirectory,
    (await fs.readdir(trafficDirectory)).length,
  ];
}
