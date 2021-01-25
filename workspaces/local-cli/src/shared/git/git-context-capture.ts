import { IPathMapping } from '@useoptic/cli-config';
import * as uuid from 'uuid';
//@ts-ignore
import niceTry from 'nice-try';
//@ts-ignore
import gitRev from './git-rev-sync-insourced.js';
import fs from 'fs-extra';
import md5file from 'md5-file';

export async function getCaptureId(paths: IPathMapping): Promise<string> {
  if (gitRev.isInRepo()) {
    const specHash = await md5file(paths.specStorePath);
    return (
      niceTry(() => `${gitRev.short(paths.basePath)}-${specHash}`) ||
      `uuid-${uuid.v4()}`
    );
  } else {
    return uuid.v4();
  }
}
