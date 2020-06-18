import {
  ICaptureService,
  IDiffService,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  ILoadInteractionResponse,
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
  constructor(private specService: ISpecService) {}

  async listDiffs(): Promise<IListDiffsResponse> {
    const interactions = await this.specService.listCapturedSamples(captureId);
    const events = await this.specService.listEvents();
    const { resolvers, rfcState } = cachingResolversAndRfcStateFromEvents(
      JSON.parse(events)
    );
    const diffs = normalizedDiffFromRfcStateAndInteractions(
      resolvers,
      rfcState,
      interactions
    );
    return {
      diffs,
    };
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    return Promise.resolve({
      urls: [],
    });
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
}
