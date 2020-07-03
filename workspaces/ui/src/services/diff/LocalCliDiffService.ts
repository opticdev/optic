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
import { JsonHttpClient } from '@useoptic/client-utilities';
import {
  DiffResultHelper,
  getOrUndefined,
  JsonHelper,
  opticEngine,
  ScalaJSHelpers,
  UrlCounterHelper,
} from '@useoptic/domain';

export class LocalCliDiffService implements IDiffService {
  constructor(
    private captureService: ICaptureService,
    private baseUrl: string,
    private config: IStartDiffResponse,
    private rfcState: any
  ) {}
  diffId(): string {
    return this.config.diffId;
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const url = `${this.baseUrl}/diffs`;
    const diffsJson = await JsonHttpClient.getJson(url);
    const diffs = opticEngine.DiffWithPointersJsonDeserializer.fromJs(
      diffsJson
    );
    return {
      diffs: ScalaJSHelpers.toJsArray(
        DiffResultHelper.endpointDiffs(diffs, this.rfcState)
      ),
    };
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const url = `${this.baseUrl}/undocumented-urls`;
    const json = (await JsonHttpClient.getJson(url)).urls;
    const result = UrlCounterHelper.fromJsonToSeq(json, this.rfcState);
    return result;
  }

  async loadStats(): Promise<ILoadStatsResponse> {
    const url = `${this.baseUrl}/stats`;
    return JsonHttpClient.getJson(url);
  }

  async loadDescription(diff: any): Promise<IGetDescriptionResponse> {
    const interaction = await this.captureService.loadInteraction(
      diff.firstInteractionPointer
    );
    if (interaction.interaction) {
      return getOrUndefined(
        DiffResultHelper.descriptionFromDiff(
          diff.diff,
          this.rfcState,
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
    return ScalaJSHelpers.toJsArray(
      DiffResultHelper.suggestionsForDiff(diff, interaction, this.rfcState)
    );
  }

  async loadInitialPreview(
    diff: any,
    currentInteraction: any,
    inferPolymorphism: boolean
  ) {
    const bodyPreview = diff.previewBodyRender(currentInteraction);
    //@todo check what this does for 'No Body' Nothing to infer. seems wasteful to load...
    let interactions = [];
    if (inferPolymorphism) {
      interactions = await Promise.all(
        ScalaJSHelpers.toJsArray(diff.randomPointers).map(async (i) => {
          const { interaction } = await this.captureService.loadInteraction(i);
          return JsonHelper.fromInteraction(interaction);
        })
      );
    } else {
      interactions = [currentInteraction];
    }

    const shapePreview = diff.previewShapeRender(
      this.rfcState,
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
