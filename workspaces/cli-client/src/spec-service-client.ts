import Bottleneck from 'bottleneck';
import { EventEmitter } from 'events';
import { JsonHttpClient } from '@useoptic/client-utilities';
import { IApiCliConfig } from '@useoptic/cli-config';

const outgoingPoll = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
});

interface IEventStore {
  serializeEvents(rfcId: RfcId): JsonString;
}

type JsonString = string;
type ListCapturesResponse = any;
type RfcId = string;
type SpecId = string;
type CaptureId = string;
type GetCaptureStatusResponse = any;
type ListCapturedSamplesResponse = any;
type GetCaptureSummaryResponse = any;

export interface ISpecService {
  loadConfig(): Promise<{ config: IApiCliConfig; configRaw: string }>;
  saveConfig(config: string): Promise<void>;
  addIgnoreRule(rule: string): Promise<void>;
  listEvents(): Promise<string>;

  saveEvents(eventStore: IEventStore, rfcId: RfcId): Promise<void>;
  saveEventsArray(serializedEvents: any[]): Promise<void>;
  processCommands(commands: any[], commitMessage: string): Promise<void>;

  listCaptures(): Promise<ListCapturesResponse>;

  listCapturedSamples(
    captureId: CaptureId
  ): Promise<ListCapturedSamplesResponse>;

  getCaptureStatus(captureId: CaptureId): Promise<GetCaptureStatusResponse>;
}

export class Client implements ISpecService {
  constructor(
    private specId: SpecId,
    private eventEmitter: EventEmitter,
    private baseUrl: string = '/api'
  ) {}

  addIgnoreRule(rule: string): Promise<void> {
    return JsonHttpClient.patchJson(
      `${this.baseUrl}/specs/${this.specId}/ignores`,
      { rule }
    );
  }

  async loadConfig(): Promise<{ config: IApiCliConfig; configRaw: string }> {
    return await JsonHttpClient.getJson(
      `${this.baseUrl}/specs/${this.specId}/config`
    );
  }

  async saveConfig(config: string): Promise<void> {
    return await JsonHttpClient.postJson(
      `${this.baseUrl}/specs/${this.specId}/config/raw`,
      { raw: config }
    );
  }

  listEvents() {
    return JsonHttpClient.getJsonAsText(
      `${this.baseUrl}/specs/${this.specId}/events`
    );
  }

  listCaptures() {
    return JsonHttpClient.getJson(
      `${this.baseUrl}/specs/${this.specId}/captures`
    );
  }

  saveEvents(eventStore: IEventStore, rfcId: RfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return JsonHttpClient.putJsonString(
      `${this.baseUrl}/specs/${this.specId}/events`,
      serializedEvents
    ).then((x) => {
      this.eventEmitter.emit('events-updated');
      return x;
    });
  }

  saveEventsArray(serializedEvents: any[]): Promise<void> {
    return JsonHttpClient.putJsonString(
      `${this.baseUrl}/specs/${this.specId}/events`,
      JSON.stringify(serializedEvents)
    ).then((x) => {
      this.eventEmitter.emit('events-updated');
      return x;
    });
  }

  listCapturedSamples(captureId: CaptureId) {
    return outgoingPoll.schedule(() => {
      return JsonHttpClient.getJson(
        `${this.baseUrl}/specs/${this.specId}/captures/${captureId}/samples`
      ).then((body) => {
        return {
          samples: body.samples,
          metadata: body.metadata,
        };
      });
    });
  }

  getCaptureStatus(captureId: CaptureId) {
    return JsonHttpClient.getJson(
      `${this.baseUrl}/specs/${this.specId}/captures/${captureId}/status`
    );
  }

  getTestingCredentials() {
    return JsonHttpClient.getJsonWithoutHandlingResponse(
      `${this.baseUrl}/specs/${this.specId}/testing-credentials`
    );
  }

  async getEnabledFeatures() {
    const response = await this.getTestingCredentials();

    return {
      TESTING_DASHBOARD: response.status >= 200 && response.status <= 299,
    };
  }

  async processCommands(commands: any[], commitMessage: string): Promise<void> {
    const newEvents = await JsonHttpClient.postJsonString(
      `${this.baseUrl}/specs/${this.specId}/commands/batches`,
      JSON.stringify({
        commands,
        commitMessage,
      })
    );

    this.eventEmitter.emit('events-appended', newEvents);
    return newEvents;
  }
}
