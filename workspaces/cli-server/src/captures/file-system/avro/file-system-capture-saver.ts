import {IHttpInteraction, ICapture} from '@useoptic/domain';
import Bottleneck from 'bottleneck';
import * as fs from 'fs-extra';
import * as path from 'path';
import {ICaptureSaver} from './file-system-capture-loader';
import {userDebugLogger} from '../../../logger';
import * as avro from 'avsc';

interface IFileSystemCaptureSaverConfig {
  captureBaseDirectory: string
}

export const schema = require('@useoptic/domain/build/domain-types/avro-schemas/capture.json');
export const serdes = avro.Type.forSchema(schema);

export const captureFileSuffix = '.optic-capture.avro';

class FileSystemCaptureSaver implements ICaptureSaver {
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({maxSize: 100, maxTime: 1000});
  private batchCount: number = 0;

  constructor(private config: IFileSystemCaptureSaverConfig) {

  }

  async init(captureId: string) {
    const outputDirectory = path.join(this.config.captureBaseDirectory, captureId);
    await fs.ensureDir(outputDirectory);

    this.batcher.on('batch', async (items: IHttpInteraction[]) => {
      userDebugLogger(`writing batch ${this.batchCount}`);
      const outputFile = path.join(outputDirectory, `${this.batchCount}${captureFileSuffix}`);
      const output: ICapture = {
        groupingIdentifiers: {
          agentGroupId: 'agent-group-id',
          agentId: 'agent-id',
          batchId: 'batch-id',
          captureId: 'capture-id'
        },
        batchItems: items
      };
      try {
        const encoder = avro.createFileEncoder(outputFile, schema);
        await new Promise((resolve, reject) => {
          encoder.write(output, (err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
        await new Promise((resolve, reject) => {
          encoder.end(() => {
            resolve();
          });
        });
        userDebugLogger(`wrote batch ${this.batchCount}`);
        this.batchCount += 1;
      } catch (e) {
        console.error(e);
      }
    });
  }

  async save(sample: IHttpInteraction) {
    // don't await flush, just enqueue
    this.batcher.add(sample);
  }
}

export {
  FileSystemCaptureSaver
};
