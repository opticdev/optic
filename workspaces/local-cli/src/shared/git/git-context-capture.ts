import { IPathMapping } from '@useoptic/cli-config';
import * as uuid from 'uuid';
//@ts-ignore
import niceTry from 'nice-try';
//@ts-ignore
import gitRev from 'git-rev-sync';
import fs from 'fs-extra';
import crypto from 'crypto';

export async function getCaptureId(paths: IPathMapping): Promise<string> {
  if (!process.env.GITFLOW_CAPTURE) {
    return uuid.v4();
  }

  if (isInRepo(paths.basePath)) {
    const specHash = await fileHash(paths.specStorePath);
    return (
      niceTry(() => `${gitRev.short(paths.basePath)}-${specHash}`) ||
      `uuid-${uuid.v4()}`
    );
  } else {
    return uuid.v4();
  }
}

export function isInRepo(basePath: string): boolean {
  try {
    gitRev.short(basePath);
    return true;
  } catch (e) {
    return false;
  }
}

function fileHash(filename: string, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    // Algorithm depends on availability of OpenSSL on platform
    // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
    let shasum = crypto.createHash(algorithm);
    try {
      let s = fs.createReadStream(filename);
      s.on('data', function (data) {
        shasum.update(data);
      });
      // making digest
      s.on('end', function () {
        const hash = shasum.digest('hex');
        return resolve(hash);
      });
    } catch (error) {
      return reject('calc fail');
    }
  });
}
