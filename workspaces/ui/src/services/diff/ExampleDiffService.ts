import {
  ICaptureService,
  IDiffService,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  ILoadInteractionResponse,
  ILoadStatsResponse,
  IRfcCommand,
  IStartDiffResponse,
} from './index';
import { IHttpInteraction } from '@useoptic/domain-types';
import { ISpecService } from '@useoptic/cli-client/build/spec-service-client';
import { captureId } from '../../components/loaders/ApiLoader';
import {
  cachingResolversAndRfcStateFromEvents,
  normalizedDiffFromRfcStateAndInteractions,
} from '@useoptic/domain-utilities';
import { DiffResultHelper, ScalaJSHelpers } from '@useoptic/domain/build';
export class ExampleCaptureService implements ICaptureService {
  async startDiff(
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[]
  ): Promise<IStartDiffResponse> {
    return {
      loadDiffUrl: '',
      loadUnrecognizedUrlsUrl: '',
      notificationUrl: '',
    };
  }
}

export class ExampleDiffService implements IDiffService {
  private readonly diffsPromise: Promise<IListDiffsResponse>;

  constructor(private specService: ISpecService) {
    async function computeInitialDiff() {
      const capture = await specService.listCapturedSamples(captureId);
      const events = await specService.listEvents();
      const { resolvers, rfcState } = cachingResolversAndRfcStateFromEvents(
        JSON.parse(events)
      );
      const diffs = normalizedDiffFromRfcStateAndInteractions(
        resolvers,
        rfcState,
        capture.samples
      );
      return {
        diffs,
        rfcState,
        resolvers,
      };
    }
    this.diffsPromise = computeInitialDiff();
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const { diffs, rfcState } = await this.diffsPromise;
    const endpointDiffs = ScalaJSHelpers.toJsArray(
      DiffResultHelper.endpointDiffs(diffs, rfcState)
    );
    return endpointDiffs;
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const { diffs, rfcState } = await this.diffsPromise;

    const urls = ScalaJSHelpers.toJsArray(
      DiffResultHelper.unmatchedUrls(diffs, rfcState)
    );

    return Promise.resolve(urls);
  }

  async loadInteraction(
    interactionPointer: string
  ): Promise<ILoadInteractionResponse> {
    const interactions = await this.specService.listCapturedSamples(captureId);
    const interaction = interactions.find(
      (x: IHttpInteraction) => x.uuid === interactionPointer
    );
    return {
      interaction,
    };
  }

  async loadStats(): Promise<ILoadStatsResponse> {
    const capture = await this.specService.listCapturedSamples(captureId);
    return Promise.resolve({
      totalInteractions: capture.samples.length,
      processed: capture.samples.length,
      captureCompleted: true,
    });
  }
}
