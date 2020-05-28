import { IInteractionBatch, IHttpInteraction } from '@useoptic/domain-types';
import Bottleneck from 'bottleneck';
import {
  developerDebugLogger,
  ICaptureSaver,
  SaasClient,
} from '../../../index';
import { serdes } from '../index';

export interface ISaasCaptureSaverConfig {
  orgId: string;
  agentGroupId: string;
  agentId: string;
  captureId: string;
  launchTokenString: string;
  baseUrl: string;
}

class CaptureSaver implements ICaptureSaver {
  private saasClient: SaasClient;
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({
    maxSize: 25,
    maxTime: 1000,
  });
  private throttler: Bottleneck = new Bottleneck({
    maxConcurrent: 10,
    minTime: 1,
  });
  private batchCount: number = 0;
  private isStopping = false;

  constructor(private config: ISaasCaptureSaverConfig) {
    this.saasClient = new SaasClient(config.baseUrl, config.launchTokenString);
  }

  async init() {
    this.batcher.on('batch', (items: IHttpInteraction[]) => {
      this.batchCount++;
      const batchId = this.batchCount.toString();
      if (this.isStopping) {
        developerDebugLogger(`batch ${batchId} came too late`);
        return;
      }
      developerDebugLogger(`scheduled batch ${batchId}`);
      this.throttler.schedule(() => {
        developerDebugLogger(`saving batch ${batchId}`);
        return this.saveBatch(batchId, items)
          .then(() => {
            developerDebugLogger(`saved batch ${batchId}`);
          })
          .catch((e) => {
            developerDebugLogger(`error in batch ${batchId}`);
            developerDebugLogger(e);
          });
      });
    });
  }

  async save(sample: IHttpInteraction) {
    this.batcher.add(sample);
  }

  private async saveBatch(batchId: string, items: IHttpInteraction[]) {
    const { agentId, agentGroupId, captureId } = this.config;
    const { uploadUrl } = await this.saasClient.getCaptureUploadUrl(
      agentId,
      batchId
    );

    const input: IInteractionBatch = {
      groupingIdentifiers: {
        agentGroupId,
        captureId,
        agentId,
        batchId,
      },
      batchItems: items,
    };
    const bytes = serdes.toBuffer(input);
    return this.saasClient.uploadCapture(uploadUrl, bytes);
  }

  async cleanup() {
    this.isStopping = true;
    developerDebugLogger('waiting for saving to finish...');
    try {
      await this.throttler.stop();
      await new Promise((resolve, reject) => {
        this.throttler.on('idle', resolve);
      });
    } catch (e) {
      developerDebugLogger(e);
    }
    developerDebugLogger('done waiting for saving to finish.');
  }
}

export { CaptureSaver };
