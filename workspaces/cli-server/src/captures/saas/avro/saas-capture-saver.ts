import {ICaptureSaver} from '../../../index';
import {Client as SaasClient} from '@useoptic/saas-client';
import {ICapture, IHttpInteraction} from '@useoptic/domain';
import Bottleneck from 'bottleneck';
import * as avro from 'avsc';
import {developerDebugLogger} from '../../../logger';

const globalLog = require('global-request-logger');
globalLog.initialize();
globalLog.on('error', function (request: any, response: any) {
  debugger
  console.error('OUTGOING_REQUEST_ERROR :(');
  console.log('Request', request);
  console.log('Response', response);
  developerDebugLogger('OUTGOING_REQUEST_ERROR :(');
  developerDebugLogger(request);
  developerDebugLogger(response);
});
export const schema = require('@useoptic/domain/build/domain-types/avro-schemas/capture.json');
export const serdes = avro.Type.forSchema(schema);

export interface IOpticLaunchToken {
  orgId: string
  agentGroupId: string
  captureId: string
}

export interface ISaasCaptureSaverConfig {
  orgId: string
  agentGroupId: string
  agentId: string
  captureId: string
  launchTokenString: string
  baseUrl: string
}

class SaasCaptureSaver implements ICaptureSaver {

  private saasClient: SaasClient;
  private batcher: Bottleneck.Batcher = new Bottleneck.Batcher({maxSize: 100, maxTime: 1000});
  private throttler: Bottleneck = new Bottleneck({maxConcurrent: 10, minTime: 1});
  private batchCount: number = 0;

  constructor(private config: ISaasCaptureSaverConfig) {
    this.saasClient = new SaasClient(config.baseUrl, config.launchTokenString);
  }

  async init(captureId: string) {
    this.batcher.on('batch', (items: IHttpInteraction[]) => {
      this.batchCount++;
      const batchId = this.batchCount.toString();
      developerDebugLogger(`scheduled batch ${batchId}`);
      this.throttler.schedule(() => {
        developerDebugLogger(`saving batch ${batchId}`);
        return this.saveBatch(batchId, items)
          .then(() => {
            developerDebugLogger(`saved batch ${batchId}`);
          })
          .catch(e => {
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
    const {agentId, agentGroupId, captureId} = this.config;
    const {uploadUrl} = await this.saasClient.getCaptureUploadUrl(agentId, batchId);

    const input: ICapture = {
      groupingIdentifiers: {
        agentGroupId,
        captureId,
        agentId,
        batchId,
      },
      batchItems: items
    };
    const bytes = serdes.toBuffer(input);
    return this.saasClient.uploadCapture(uploadUrl, bytes);
  }

  async cleanup() {
    developerDebugLogger('waiting for saving to finish...');
    try {
      await new Promise((resolve, reject) => {
        this.throttler.on('idle', resolve);
      });
    } catch (e) {
      developerDebugLogger(e);
    }
  }
}

export {
  SaasCaptureSaver
};