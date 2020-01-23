import {IApiInteraction} from '@useoptic/domain';
import Bottleneck from 'bottleneck';
import * as fs from 'fs-extra';
import * as path from 'path';
import {ICaptureSaver} from './index';
import {userDebugLogger} from './logger';

interface IFileSystemCaptureSaverConfig {
  captureBaseDirectory: string
}

export const captureFileSuffix = '.optic-capture.json';

class FileSystemCaptureSaver implements ICaptureSaver {
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({maxSize: 100, maxTime: 1000});
  private batchCount: number = 0;

  constructor(private config: IFileSystemCaptureSaverConfig) {

  }

  async init(captureId: string) {
    const outputDirectory = path.join(this.config.captureBaseDirectory, captureId);
    await fs.ensureDir(outputDirectory);
    this.batcher.on('batch', async (items: IApiInteraction[]) => {
      userDebugLogger(`writing batch ${this.batchCount}`);
      const outputFile = path.join(outputDirectory, `${this.batchCount}${captureFileSuffix}`);
      await fs.writeJson(outputFile, items);
      this.batchCount += 1;
    });
  }

  async save(sample: IApiInteraction) {
    // don't await flush, just enqueue
    this.batcher.add(sample);
  }
}

export {
  FileSystemCaptureSaver
};
