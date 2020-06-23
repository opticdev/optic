import {
  ICaptureService,
  IDiffService,
  IGetDescriptionResponse,
  IListDiffsResponse,
  IListSuggestionsResponse,
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
  cachingResolversAndRfcStateFromEventsAndAdditionalCommands,
  normalizedDiffFromRfcStateAndInteractions,
} from '@useoptic/domain-utilities';
import {
  DiffResultHelper,
  JsonHelper,
  RfcCommandContext,
  ScalaJSHelpers,
} from '@useoptic/domain/build';
import uuidv4 from 'uuid/v4';
import { getOrUndefined } from '@useoptic/domain';

export class ExampleCaptureService implements ICaptureService {
  async startDiff(
    events: any[],
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

  constructor(
    private specService: ISpecService,
    private additionalCommands: IRfcCommand[]
  ) {
    async function computeInitialDiff() {
      const capture = await specService.listCapturedSamples(captureId);
      const events = await specService.listEvents();

      const commandContext = new RfcCommandContext(
        'simulated',
        'simulated',
        'simulated'
      );

      const {
        resolvers,
        rfcState,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
        JSON.parse(events),
        commandContext,
        additionalCommands
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
  private _diffId: string = uuidv4();
  diffId(): string {
    return this._diffId;
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
    const capture = await this.specService.listCapturedSamples(captureId);
    const interaction = capture.samples.find(
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

  async loadDescription(diff: any): Promise<IGetDescriptionResponse> {
    const { rfcState } = await this.diffsPromise;
    const interaction = await this.loadInteraction(
      diff.firstInteractionPointer
    );
    if (interaction.interaction) {
      return getOrUndefined(
        DiffResultHelper.descriptionFromDiff(
          diff.diff,
          rfcState,
          JsonHelper.fromInteraction(interaction.interaction)
        )
      );
    } else {
      return null;
    }
  }

  async listSuggestions(
    diff: any,
    interaction: any
  ): Promise<IListSuggestionsResponse> {
    const { rfcState } = await this.diffsPromise;
    return ScalaJSHelpers.toJsArray(
      DiffResultHelper.suggestionsForDiff(diff, interaction, rfcState)
    );
  }

  async loadInitialPreview(
    diff: any,
    currentInteraction: any,
    inferPolymorphism: boolean
  ) {
    const { rfcState } = await this.diffsPromise;
    const bodyPreview = diff.previewBodyRender(currentInteraction);

    let interactions = [];
    if (inferPolymorphism) {
      interactions = await Promise.all(
        ScalaJSHelpers.toJsArray(diff.interactionPointers).map(async (i) => {
          const { interaction } = await this.loadInteraction(i);
          return JsonHelper.fromInteraction(interaction);
        })
      );
    } else {
      interactions = [currentInteraction];
    }

    const shapePreview = diff.previewShapeRender(
      rfcState,
      JsonHelper.jsArrayToVector(interactions),
      inferPolymorphism
    );

    return {
      bodyPreview,
      shapePreview: shapePreview.shape,
      suggestion: shapePreview.suggestion,
    };
  }
}
