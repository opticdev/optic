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

  private tracking: Bottleneck = new Bottleneck({
    maxConcurrent: 10,
    minTime: 1,
  });

  private batchCount: number = 0;

  constructor(private config: IFileSystemCaptureSaverConfig) {}

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
        const promise: Promise<void> = this.onBatch(
          groupingIdentifiers,
          batchId,
          items,
          outputDirectory
        );

        this.tracking.schedule(() => promise);
        await promise;
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
    // don't await flushSuggestions, just enqueue
    await this.batcher.add(sample);
  }

  async cleanup() {
    developerDebugLogger('stopping capture saver');
    await this.tracking.stop({ dropWaitingJobs: false });
    developerDebugLogger('stopped capture saver');
  }
}
