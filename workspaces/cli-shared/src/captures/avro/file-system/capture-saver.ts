import Bottleneck from 'bottleneck';
import fs from 'fs-extra';
import path from 'path';
import avro from 'avsc';
import {
  IInteractionBatch,
  IGroupingIdentifiers,
  IHttpInteraction,
} from '@useoptic/domain-types';
import { developerDebugLogger, ICaptureSaver } from '../../../index';
import { captureFileSuffix } from './index';
import { schema } from '../index';

interface IFileSystemCaptureSaverConfig {
  captureBaseDirectory: string;
  captureId: string;
}

export class CaptureSaver implements ICaptureSaver {
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({
    maxSize: 20,
    maxTime: 500,
  });

  private batchCount: number = 0;

  constructor(private config: IFileSystemCaptureSaverConfig) {
    const sessionDirectory = path.join(
      this.config.captureBaseDirectory,
      this.config.captureId
    );
    const entries = fs.readdirSync(sessionDirectory);

    const captureFiles = entries.filter((x) => x.endsWith(captureFileSuffix));
    //provide for continuation
    this.batchCount = captureFiles.length || 0;
  }

  async init() {
    const { captureId } = this.config;
    const outputDirectory = path.join(
      this.config.captureBaseDirectory,
      captureId
    );
    await fs.ensureDir(outputDirectory);
    const agentId = '';
    const agentGroupId = '';
    this.batcher.on('batch', async (items: IHttpInteraction[]) => {
      const batchId = this.batchCount.toString();
      this.batchCount++;
      const groupingIdentifiers: IGroupingIdentifiers = {
        captureId,
        agentId,
        agentGroupId,
        batchId,
      };
      try {
        await this.onBatch(
          groupingIdentifiers,
          batchId,
          items,
          outputDirectory
        );
      } catch (e) {
        console.error(e);
      }
    });
  }

  async onBatch(
    groupingIdentifiers: IGroupingIdentifiers,
    batchId: string,
    items: IHttpInteraction[],
    outputDirectory: string
  ) {
    const outputFile = path.join(
      outputDirectory,
      `${batchId}${captureFileSuffix}`
    );
    const output: IInteractionBatch = {
      groupingIdentifiers,
      batchItems: items,
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
    } catch (e) {
      console.error(e);
    }
  }

  async save(sample: IHttpInteraction) {
    // don't await flush, just enqueue
    this.batcher.add(sample);
  }

  async cleanup() {
    developerDebugLogger('stopping capture saver');
  }
}
