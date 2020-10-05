import {
  developerDebugLogger,
  FileSystemAvroCaptureSaver,
} from '../../../index';
import { IGroupingIdentifiers, IHttpInteraction } from '@useoptic/domain-types';
import { IFileSystemCaptureLoaderConfig } from './capture-loader';
import { ISpecService } from '@useoptic/cli-client/build/spec-service-client';
import {
  diffFromRfcStateAndInteractions,
  universeFromEvents,
} from '@useoptic/domain-utilities';
import {
  DiffHelpers,
  JsonHelper,
  opticEngine,
  Queries,
} from '@useoptic/domain';
import fs from 'fs-extra';
import path from 'path';
import { IApiCliConfig, parseIgnore } from '@useoptic/cli-config';
import { coverageFilePrefix } from '@useoptic/cli/lib/shared/coverage';

export class CaptureSaverWithDiffs extends FileSystemAvroCaptureSaver {
  private rfcState!: any;
  private shapesResolvers!: any;

  constructor(
    config: IFileSystemCaptureLoaderConfig,
    private cliConfig: IApiCliConfig,
    private specServiceClient: ISpecService
  ) {
    super(config);
  }

  async init() {
    //@GOTCHA: if the user updates the spec while the capture is live, the diff data will potentially be inaccurate
    const eventsString = await this.specServiceClient.listEvents();
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

    // diff report
    const diffs = diffFromRfcStateAndInteractions(
      this.shapesResolvers,
      this.rfcState,
      items
    );

    const distinctDiffCount = DiffHelpers.distinctDiffCount(diffs);
    const diffsAsJs = opticEngine.DiffJsonSerializer.toJs(diffs);
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
      diffsAsJs
    );

    // coverage report as JS
    const report = opticEngine.com.useoptic.diff.helpers
      .CoverageHelpers()
      .getCoverage(
        this.shapesResolvers,
        this.rfcState,
        JsonHelper.jsArrayToSeq(items.map((x) => JsonHelper.fromInteraction(x)))
      );

    const asJs = opticEngine.CoverageReportJsonSerializer.toJs(report);

    await fs.writeJson(
      path.join(outputDirectory, `${coverageFilePrefix}${batchId}.json`),
      asJs
    );

    return result;
  }
}
