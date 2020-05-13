import { IHttpInteraction, ICapture } from '@useoptic/domain';
import Bottleneck from 'bottleneck';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ICaptureSaver } from './file-system-capture-loader';
import { developerDebugLogger, userDebugLogger } from '../../../logger';
import * as avro from 'avsc';
import fetch from 'node-fetch';
import * as uuid from 'uuid';

interface IFileSystemCaptureSaverConfig {
  captureBaseDirectory: string;
}

export const schema = require('@useoptic/domain/build/domain-types/avro-schemas/capture.json');
export const serdes = avro.Type.forSchema(schema);

export const captureFileSuffix = '.optic-capture.avro';
const shouldDumpRaw = process.env.OPTIC_ENABLE_DUMP === 'yes';

class FileSystemCaptureSaver implements ICaptureSaver {
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({
    maxSize: 100,
    maxTime: 1000,
  });
  private batchCount: number = 0;

  constructor(private config: IFileSystemCaptureSaverConfig) {}

  async init(captureId: string) {
    const outputDirectory = path.join(
      this.config.captureBaseDirectory,
      captureId
    );
    await fs.ensureDir(outputDirectory);
    const agentId = uuid.v4();
    const agentGroupId = 'ddoshi-test-service';
    this.batcher.on('batch', async (items: IHttpInteraction[]) => {
      userDebugLogger(`writing batch ${this.batchCount}`);
      const outputFile = path.join(
        outputDirectory,
        `${this.batchCount}${captureFileSuffix}`
      );
      const batchId = this.batchCount.toString();
      this.batchCount += 1;
      const output: ICapture = {
        groupingIdentifiers: {
          agentGroupId,
          agentId,
          batchId,
          captureId,
        },
        batchItems: items,
      };

      try {
        if (shouldDumpRaw) {
          const bytes = serdes.toBuffer(output);
          developerDebugLogger(bytes);
          await fs.writeFile(
            path.join(outputDirectory, `${this.batchCount}.raw.avro`),
            bytes
          );
          fetch('https://analytics.useoptic.com/schema1', {
            method: 'POST',
            headers: {
              'content-type': 'application/optic-capture-v1',
              'content-length': bytes.length.toString(),
            },
            body: bytes,
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  `Error dumping :( ${response.status} ${response.statusText}`
                );
              }
              const text = await response.text();
              developerDebugLogger(text);
            })
            .catch((e) => {
              console.error(e);
              developerDebugLogger(e);
            });
        }

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

  async cleanup() {}
}

export { FileSystemCaptureSaver };
