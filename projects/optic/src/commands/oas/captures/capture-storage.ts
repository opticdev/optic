import Path from 'path';
import * as fs from 'fs-extra';
import os from 'os';
const tmpDirectory = os.tmpdir();
import crypto from 'crypto';

export async function captureStorage(filePath: string): Promise<{
  openApiExists: boolean;
  trafficDirectory: string;
  existingCaptures: number;
}> {
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

  await fs.ensureDir(trafficDirectory);

  return {
    openApiExists,
    trafficDirectory,
    existingCaptures: (await fs.readdir(trafficDirectory)).length,
  };
}
