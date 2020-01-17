import * as fs from 'fs-extra';
import * as path from 'path';
import {captureFileSuffix} from './file-system-session-persistence';
import {ISessionLoader, ISessionManifest} from './index';

interface IFileSystemSessionLoaderConfig {
  captureBaseDirectory: string
}

const suffixOffset = -1 * captureFileSuffix.length;

class FileSystemSessionLoader implements ISessionLoader {
  constructor(private config: IFileSystemSessionLoaderConfig) {
  }

  async load(sessionId: string): Promise<ISessionManifest> {
    const sessionDirectory = path.join(this.config.captureBaseDirectory, sessionId);
    const entries = await fs.readdir(sessionDirectory);
    console.log({entries});
    const captureFiles = entries
      .filter(x => x.endsWith(captureFileSuffix))
      .sort((a, b) => {
        const aBatchNumber = parseInt(a.slice(0, suffixOffset), 10);
        const bBatchNumber = parseInt(b.slice(0, suffixOffset), 10);
        console.log({
          aBatchNumber,
          bBatchNumber
        });
        return aBatchNumber - bBatchNumber;
      });

    //@TODO: robustify by only reading n files at a time
    const entriesContents = await Promise.all(captureFiles.map(x => fs.readJson(path.join(sessionDirectory, x))));
    const allSamples = entriesContents.reduce((acc, entrySamples) => [...acc, ...entrySamples], []);
    return {
      samples: allSamples
    };
  }
}

export {
  FileSystemSessionLoader
};
