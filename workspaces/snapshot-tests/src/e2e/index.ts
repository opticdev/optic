import * as path from 'path';

export interface ICaptureService {
  startDiff(
    events: any[],
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[],
    filters: { pathId: string; method: string }[]
  ): Promise<IStartDiffResponse>;
  loadInteraction(
    interactionPointer: string
  ): Promise<ILoadInteractionResponse>;
}

export interface IDiffService {
  listDiffs(): Promise<IListDiffsResponse>;
  listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse>;
  loadStats(): Promise<ILoadStatsResponse>;
}

export interface IRfcCommand {}

export interface ILoadStatsResponse {
  diffedInteractionsCounter: string;
  skippedInteractionsCounter: string;
}

export interface IStartDiffResponse {
  diffId: string;
  notificationsUrl?: string;
}
export interface ILoadInteractionResponse {
  interaction: IHttpInteraction;
}
export interface IListDiffsResponse {
  diffs: any[];
}

export interface IListUnrecognizedUrlsResponse {
  urls: any[];
}

export interface IGetDescriptionResponse {}
export interface IListSuggestionsResponse {}

import { JsonHttpClient } from '@useoptic/client-utilities';
import { IHttpInteraction } from '@useoptic/domain-types';

export class LocalCliDiffService implements IDiffService {
  constructor(
    private captureService: ICaptureService,
    private baseUrl: string,
    private config: IStartDiffResponse
  ) {}
  diffId(): string {
    return this.config.diffId;
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const url = `${this.baseUrl}/diffs`;
    const diffsJson = await JsonHttpClient.getJson(url);
    // const diffs = opticEngine.DiffWithPointersJsonDeserializer.fromJs(
    //   diffsJson
    // );
    return {
      diffs: diffsJson,
    };
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const url = `${this.baseUrl}/undocumented-urls`;
    const json = (await JsonHttpClient.getJson(url)).urls;
    //const result = UrlCounterHelper.fromJsonToSeq(json, this.rfcState);
    return json;
  }

  async loadStats(): Promise<ILoadStatsResponse> {
    const url = `${this.baseUrl}/stats`;
    return JsonHttpClient.getJson(url);
  }
}

export class LocalCliCaptureService implements ICaptureService {
  constructor(private baseUrl: string) {}

  async startDiff(
    events: any[],
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[],
    filters: { pathId: string; method: string }[]
  ): Promise<IStartDiffResponse> {
    const url = `${this.baseUrl}/diffs`;
    return JsonHttpClient.postJson(url, {
      ignoreRequests,
      additionalCommands,
      events,
      filters,
    });
  }

  loadInteraction(
    interactionPointer: string
  ): Promise<ILoadInteractionResponse> {
    const url = `${this.baseUrl}/interactions/${interactionPointer}`;
    return JsonHttpClient.getJson(url);
  }
}
import EventSource from 'eventsource';
import fs from 'fs-extra';
import { delay } from '@useoptic/cli-shared';
async function main(input: {
  baseDirectory: string;
  outputBaseDirectory: string;
}) {
  const totalInteractionsCount = BigInt(16);
  const apiId = '1';
  const captureId = 'ccc';
  const apiBaseUrl = 'http://localhost:34444';
  const baseUrl = `${apiBaseUrl}/api/specs/${apiId}/captures/${captureId}`;
  const captureService = new LocalCliCaptureService(baseUrl);
  const events: any[] = await fs.readJson(
    path.join(input.baseDirectory, '.optic', 'api', 'specification.json')
  );
  const ignoreRequests: any[] = [];
  const additionalCommands: any[] = [];
  const filters: any[] = [];
  const diffInstance = await captureService.startDiff(
    events,
    ignoreRequests,
    additionalCommands,
    filters
  );
  if (!diffInstance.notificationsUrl) {
    throw new Error('expected diffInstance to have a notificationsUrl');
  }
  console.log(diffInstance);
  const notificationChannel = new EventSource(
    `${apiBaseUrl}${diffInstance.notificationsUrl}`
  );

  await new Promise((resolve, reject) => {
    notificationChannel.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'message') {
        console.log(data);
        if (
          data.diffedInteractionsCounter === totalInteractionsCount.toString()
        ) {
          resolve();
        }
      } else if (type === 'error') {
        console.error(data);
        debugger;
      }
    };
    notificationChannel.onerror = (e) => {
      console.error(e);
      reject(e);
    };
    notificationChannel.onopen = (e) => {
      console.log(e);
    };
  });
  notificationChannel.close();
  console.log('ready');
  const diffService = new LocalCliDiffService(
    captureService,
    `${baseUrl}/diffs/${diffInstance.diffId}`,
    diffInstance
  );

  await delay(3000);

  const [diffs, unrecognizedUrls /*stats*/] = await Promise.all([
    diffService.listDiffs(),
    diffService.listUnrecognizedUrls(),
    //diffService.loadStats(),
  ]);

  console.log({
    diffs,
    unrecognizedUrls,
    // stats,
  });

  function normalizeJson(json: any) {
    if (Array.isArray(json)) {
      json.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    } else if (typeof json === 'object') {
      Object.keys(json).forEach((k) => {
        json[k] = normalizeJson(json[k]);
      });
    }
    return json;
  }

  await fs.ensureDir(input.outputBaseDirectory);
  await Promise.all([
    fs.writeJson(
      path.join(input.outputBaseDirectory, 'diffs.json'),
      normalizeJson(diffs),
      {
        spaces: 2,
      }
    ),
    fs.writeJson(
      path.join(input.outputBaseDirectory, 'unrecognizedUrls.json'),
      unrecognizedUrls,
      { spaces: 2 }
    ),
    // fs.writeJson(path.join(input.outputBaseDirectory, 'stats.json'), stats),
  ]);
}

const [, , outputBaseDirectory, baseDirectory] = process.argv;
main({ baseDirectory, outputBaseDirectory })
  .then(() => {
    console.log('Done!');
  })
  .catch((e) => {
    console.error(e);
  });

/*
set -o errexit

OPTIC_DIR=~/work/optic
cd "$OPTIC_DIR"

export OPTIC_RUST_DIFF_ENGINE=true
source sourceme.sh
optic_build

 */
