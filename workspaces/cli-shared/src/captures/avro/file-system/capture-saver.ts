import Bottleneck from 'bottleneck';
import fs from 'fs-extra';
import path from 'path';
import avro from 'avsc';
import { IGroupingIdentifiers, IHttpInteraction } from '@useoptic/domain-types';
import { developerDebugLogger, ICaptureSaver } from '../../../index';
import { captureFileSuffix } from './index';
import { serdesWithBodies } from './avro-schemas/interaction-batch-helpers';

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
  private interactionsReceivedCount: number = 0;
  private interactionsSavedCount: number = 0;

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
      developerDebugLogger(
        `handling batch id=${batchId} (${items.length} interactions)`
      );
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

        await this.tracking.schedule(() => promise);
        developerDebugLogger(
          `handled batch id=${batchId} (${items.length} interactions)`
        );
        this.interactionsSavedCount += items.length;
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
    try {
      const encoder = avro.createFileEncoder(outputFile, serdesWithBodies);
      await new Promise((resolve, reject) => {
        for (const item of items) {
          encoder.write(item, (err) => {
            if (err) {
              return reject(err);
            }
          });
        }
        resolve();
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
    this.interactionsReceivedCount++;
    // don't await flush, just enqueue
    this.batcher.add(sample);
  }

  async cleanup() {
    developerDebugLogger('stopping capture saver');

    await new Promise((resolve, reject) => {
      const poll = () => {
        const interactionsReceivedCount = this.interactionsReceivedCount;
        const interactionsSavedCount = this.interactionsSavedCount;
        developerDebugLogger(
          'waiting until interactionsReceivedCount matches interactionsSavedCount...',
          interactionsReceivedCount,
          interactionsSavedCount
        );
        if (interactionsSavedCount === interactionsReceivedCount) {
          developerDebugLogger(
            'done waiting until interactionsReceivedCount matches interactionsSavedCount',
            interactionsReceivedCount,
            interactionsSavedCount
          );
          resolve();
        } else {
          setTimeout(poll, 50);
        }
      };
      poll();
    });

    await this.tracking.stop({ dropWaitingJobs: false });

    developerDebugLogger('stopped capture saver');
  }
}
