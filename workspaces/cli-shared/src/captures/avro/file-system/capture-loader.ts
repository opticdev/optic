import {
  developerDebugLogger,
  ICaptureLoader,
  ICaptureManifest,
} from '../../../index';
import { IIgnoreRunnable } from '@useoptic/cli-config';
import { captureFileSuffix } from './index';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ICapture, IHttpInteraction } from '@useoptic/domain-types';
import * as avro from 'avsc';

export interface IFileSystemCaptureLoaderConfig {
  captureBaseDirectory: string;
  captureId: string;
}

const suffixOffset = -1 * captureFileSuffix.length;

export class CaptureLoader implements ICaptureLoader {
  constructor(private config: IFileSystemCaptureLoaderConfig) {}

  private async listSortedCaptureFiles(captureId: string) {
    const sessionDirectory = path.join(
      this.config.captureBaseDirectory,
      captureId
    );
    const entries = await fs.readdir(sessionDirectory);
    developerDebugLogger({ entries });
    const captureFiles = entries
      .filter((x) => x.endsWith(captureFileSuffix))
      .sort((a, b) => {
        const aBatchNumber = parseInt(a.slice(0, suffixOffset), 10);
        const bBatchNumber = parseInt(b.slice(0, suffixOffset), 10);
        return aBatchNumber - bBatchNumber;
      })
      .map((x) => path.join(sessionDirectory, x));
    developerDebugLogger({ captureFiles });
    return captureFiles;
  }

  async load(): Promise<ICaptureManifest> {
    const captureId = this.config.captureId;
    const captureFiles = await this.listSortedCaptureFiles(captureId);
    //@TODO: robustify by only reading n files at a time
    const entriesContents: ICapture[] = await Promise.all(
      captureFiles.map((x) => {
        const decoder = avro.createFileDecoder(x);

        return new Promise<ICapture>((resolve, reject) => {
          decoder.once('data', (contents: ICapture) => {
            resolve(contents);
          });
          decoder.once('error', (err) => reject(err));
        });
      })
    );
    const allSamples = entriesContents.reduce(
      (acc: IHttpInteraction[], capture: ICapture) => [
        ...acc,
        ...capture.batchItems,
      ],
      []
    );
    return {
      samples: allSamples,
    };
  }

  async loadWithFilter(filter: IIgnoreRunnable): Promise<ICaptureManifest> {
    const captureId = this.config.captureId;
    const captureFiles = await this.listSortedCaptureFiles(captureId);
    //@TODO: robustify by only reading n files at a time
    const entriesContents: ICapture[] = await Promise.all(
      captureFiles.map((x) => {
        const decoder = avro.createFileDecoder(x);

        return new Promise<ICapture>((resolve, reject) => {
          decoder.once('data', (contents: ICapture) => {
            resolve(contents);
          });
          decoder.once('error', (err) => reject(err));
        });
      })
    );
    const filteredSamples = entriesContents.reduce(
      (acc: IHttpInteraction[], capture: ICapture) => {
        const filteredEntrySamples = capture.batchItems.filter(
          (x: IHttpInteraction) => {
            return !filter.shouldIgnore(x.request.method, x.request.path);
          }
        );
        return [...acc, ...filteredEntrySamples];
      },
      []
    );
    return {
      samples: filteredSamples,
    };
  }
}
