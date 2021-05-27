import {
  developerDebugLogger,
  FileSystemAvroCaptureSaver,
} from '../../../index';
import { IFileSystemCaptureLoaderConfig } from './capture-loader';
import { ISpecService } from '@useoptic/cli-client/build/spec-service-client';
import fs from 'fs-extra';
import path from 'path';
import { IApiCliConfig, parseIgnore } from '@useoptic/cli-config';
import * as OpticEngine from '@useoptic/optic-engine-wasm';
import { IGroupingIdentifiers, IHttpInteraction } from '../../../optic-types';

interface IFileSystemCaptureLoaderWithDiffsConfig
  extends IFileSystemCaptureLoaderConfig {
  shouldCollectDiffs: boolean;
}

export class CaptureSaverWithDiffs extends FileSystemAvroCaptureSaver {
  private spec!: any;

  constructor(
    private _config: IFileSystemCaptureLoaderWithDiffsConfig,
    private cliConfig: IApiCliConfig,
    private specServiceClient: ISpecService
  ) {
    super(_config);
  }

  async init() {
    //@GOTCHA: if the user updates the spec while the capture is live, the diff data will potentially be inaccurate
    const eventsString = await this.specServiceClient.listEvents();
    const spec = OpticEngine.spec_from_events(eventsString);
    this.spec = spec;

    developerDebugLogger('built initial spec for diffing on the fly');
    await super.init();
  }

  async onBatch(
    groupingIdentifiers: IGroupingIdentifiers,
    batchId: string,
    items: IHttpInteraction[],
    outputDirectory: string
  ): Promise<void> {
    const result = super.onBatch(
      groupingIdentifiers,
      batchId,
      items,
      outputDirectory
    );
    //@TODO: create an endpoint within spec-router that has similar logic but takes the spec and interactions as inputs
    const filter = parseIgnore(this.cliConfig.ignoreRequests || []);
    const filteredItems = items.filter(
      (x) => !filter.shouldIgnore(x.request.method, x.request.path)
    );

    if (this._config.shouldCollectDiffs) {
      const distinctDiffs = new Set<string>();
      const diffs = [];
      for (let interaction of filteredItems) {
        const resultsString: string = OpticEngine.diff_interaction(
          JSON.stringify(interaction),
          this.spec
        );
        const results = JSON.parse(resultsString);
        results.forEach((result: any) => {
          developerDebugLogger(result);
          const [diff] = result;
          distinctDiffs.add(JSON.stringify(diff));
        });
        diffs.push(...results);
      }

      const distinctDiffCount = distinctDiffs.size;
      developerDebugLogger({ distinctDiffCount });
      await fs.writeJson(
        path.join(outputDirectory, `interactions-${batchId}.json`),
        {
          interactionsCount: filteredItems.length,
          totalInteractionsCount: items.length,
          diffsCount: distinctDiffCount,
          createdAt: new Date().toISOString(),
        }
      );
      await fs.writeJson(
        path.join(outputDirectory, `diffs-${batchId}.json`),
        diffs
      );
    }

    return result;
  }
}
