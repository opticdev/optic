import {IIgnoreRunnable} from '@useoptic/cli-config';
import {IApiInteraction} from '@useoptic/domain';
import * as fs from 'fs-extra';
import * as path from 'path';
import {captureFileSuffix} from './file-system-capture-saver';
import {ICaptureLoader, ICaptureManifest} from './index';
import {developerDebugLogger} from './logger';

interface IFileSystemCaptureLoaderConfig {
  captureBaseDirectory: string
}

const suffixOffset = -1 * captureFileSuffix.length;

class FileSystemCaptureLoader implements ICaptureLoader {
  constructor(private config: IFileSystemCaptureLoaderConfig) {
  }

  private async listSortedCaptureFiles(captureId: string) {
    const sessionDirectory = path.join(this.config.captureBaseDirectory, captureId);
    const entries = await fs.readdir(sessionDirectory);
    developerDebugLogger({entries});
    const captureFiles = entries
      .filter(x => x.endsWith(captureFileSuffix))
      .sort((a, b) => {
        const aBatchNumber = parseInt(a.slice(0, suffixOffset), 10);
        const bBatchNumber = parseInt(b.slice(0, suffixOffset), 10);
        return aBatchNumber - bBatchNumber;
      })
      .map(x => path.join(sessionDirectory, x));
    developerDebugLogger({captureFiles});
    return captureFiles;
  }

  async load(captureId: string): Promise<ICaptureManifest> {
    const captureFiles = await this.listSortedCaptureFiles(captureId);
    //@TODO: robustify by only reading n files at a time
    const entriesContents: IApiInteraction[][] = await Promise.all(captureFiles.map(x => fs.readJson(x)));
    const allSamples = entriesContents.reduce((acc, entrySamples) => [...acc, ...entrySamples], []);
    return {
      samples: allSamples
    };
  }

  async loadWithFilter(captureId: string, filter: IIgnoreRunnable): Promise<ICaptureManifest> {
    const captureFiles = await this.listSortedCaptureFiles(captureId);
    //@TODO: robustify by only reading n files at a time
    const entriesContents: IApiInteraction[][] = await Promise.all(captureFiles.map(x => fs.readJson(x)));
    const filteredSamples = entriesContents.reduce((acc: IApiInteraction[], entrySamples: IApiInteraction[]) => {
      const filteredEntrySamples = entrySamples.filter((x: IApiInteraction) => {
        console.log(filter)
        console.log(x)
        console.log(filter.shouldIgnore(x.request.method, x.request.url))
        return !filter.shouldIgnore(x.request.method, x.request.url);
      });
      return [...acc, ...filteredEntrySamples];
    }, []);
    return {
      samples: filteredSamples
    };
  }
}

export {
  FileSystemCaptureLoader
};
