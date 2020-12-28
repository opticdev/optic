import { IPathMapping } from '@useoptic/cli-config';
import * as uuid from 'uuid';
//@ts-ignore
import niceTry from 'nice-try';
//@ts-ignore
import gitRev from './git-rev-sync-insourced.js';

export function getCaptureId(paths: IPathMapping): string {
  if (process.env.GITFLOW_CAPTURE) {
    return niceTry(() => gitRev.long(paths.basePath)) || `uuid-${uuid.v4()}`;
  } else {
    return uuid.v4();
  }
}
