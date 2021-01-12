import {
  developerDebugLogger,
  FileSystemAvroCaptureSaver,
} from '../../../index';
import { IGroupingIdentifiers, IHttpInteraction } from '@useoptic/domain-types';
import { IFileSystemCaptureLoaderConfig } from './capture-loader';
import { ISpecService } from '@useoptic/cli-client/build/spec-service-client';
import { universeFromEvents } from '@useoptic/domain-utilities';
import { JsonHelper, opticEngine, Queries } from '@useoptic/domain';
import fs from 'fs-extra';
import path from 'path';
import { IApiCliConfig, parseIgnore } from '@useoptic/cli-config';
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';

export const coverageFilePrefix = 'coverage-';

interface IFileSystemCaptureLoaderWithDiffsAndCoverageConfig
  extends IFileSystemCaptureLoaderConfig {
  shouldCollectCoverage: boolean;
}

export class CaptureSaverWithDiffs extends FileSystemAvroCaptureSaver {
  private spec!: any;
  private rfcState!: any;
  private shapesResolvers!: any;

  constructor(
    private _config: IFileSystemCaptureLoaderWithDiffsAndCoverageConfig,
    private cliConfig: IApiCliConfig,
    private specServiceClient: ISpecService
  ) {
    super(_config);
  }

  async init() {
    //@GOTCHA: if the user updates the spec while the capture is live, the diff data will potentially be inaccurate
    const eventsString = await this.specServiceClient.listEvents();
    const spec = DiffEngine.spec_from_events(eventsString);
    this.spec = spec;
    const events = JSON.parse(eventsString);
    const { eventStore, rfcState, rfcService, rfcId } = universeFromEvents(
      events
    );

    const queries = Queries(eventStore, rfcService, rfcId);
    const shapesResolvers = queries.shapesResolvers();
    this.rfcState = rfcState;
    this.shapesResolvers = shapesResolvers;
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

    const distinctDiffs = new Set<string>();
    const diffs = [];
    for (let interaction of filteredItems) {
      const resultsString: string = DiffEngine.diff_interaction(
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

    if (this._config.shouldCollectCoverage) {
      const report = opticEngine.com.useoptic.diff.helpers
        .CoverageHelpers()
        .getCoverage(
          this.shapesResolvers,
          this.rfcState,
          JsonHelper.jsArrayToSeq(
            items.map((x) => JsonHelper.fromInteraction(x))
          )
        );

      const asJs = opticEngine.CoverageReportJsonSerializer.toJs(report);

      await fs.writeJson(
        path.join(outputDirectory, `${coverageFilePrefix}${batchId}.json`),
        asJs
      );
    }

    return result;
  }
}
