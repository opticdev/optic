import { IPathMapping } from '@useoptic/cli-config';
import * as uuid from 'uuid';
//@ts-ignore
import niceTry from 'nice-try';
//@ts-ignore
import gitRev from './git-rev-sync-insourced.js';
import fs from 'fs-extra'

export async function getCaptureId(paths: IPathMapping): Promise<string> {
  if (gitRev.isInRepo()) {
    const specSize = (await fs.stat(paths.specStorePath)).size
    return niceTry(() => `${gitRev.short(paths.basePath)}-${specSize.toString()}`) || `uuid-${uuid.v4()}`;
  } else {
    return uuid.v4();
  }
}
