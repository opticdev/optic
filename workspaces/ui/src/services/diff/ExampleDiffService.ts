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
  DiffResultHelper,
  JsonHelper,
  RfcCommandContext,
  ScalaJSHelpers,
  UrlCounterHelper,
} from '@useoptic/domain/build';
import uuidv4 from 'uuid/v4';
import { getOrUndefined, opticEngine } from '@useoptic/domain';

export class ExampleCaptureService implements ICaptureService {
  constructor(private specService: ISpecService) {}

  async startDiff(
    events: any[],
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[],
    filters: { pathId: string; method: string }[]
  ): Promise<IStartDiffResponse> {
    return {
      diffId: uuidv4(),
      notificationsUrl: '',
    };
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
}

export class ExampleDiffService implements IDiffService {
  constructor(
    private specService: ISpecService,
    private captureService: ICaptureService,
    private diffConfig: IStartDiffResponse,
    private diffs: any,
    private rfcState: any
  ) {}

  diffId(): string {
    return this.diffConfig.diffId;
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const endpointDiffs = ScalaJSHelpers.toJsArray(
      DiffResultHelper.endpointDiffs(this.diffs, this.rfcState)
    );

    return Promise.resolve({ diffs: endpointDiffs });
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const capture = await this.specService.listCapturedSamples(captureId);
    const samplesSeq = JsonHelper.jsArrayToSeq(
      capture.samples.map((x) => JsonHelper.fromInteraction(x))
    );
    const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlHelpers();
    const counter = undocumentedUrlHelpers.countUndocumentedUrls(
      this.rfcState,
      samplesSeq
    );
    const urls = opticEngine.UrlCounterJsonSerializer.toFriendlyJs(counter);

    const result = UrlCounterHelper.fromJsonToSeq(urls, this.rfcState);

    return Promise.resolve(result);
  }

  async loadStats(): Promise<ILoadStatsResponse> {
    const capture = await this.specService.listCapturedSamples(captureId);

    return Promise.resolve({
      diffedInteractionsCounter: capture.samples.length.toString(),
      skippedInteractionsCounter: '0',
    });
  }

  async loadDescription(diff: any): Promise<IGetDescriptionResponse> {
    const interaction = await this.captureService.loadInteraction(
      diff.firstInteractionPointer
    );
    if (interaction.interaction) {
      return getOrUndefined(
        DiffResultHelper.descriptionFromDiff(
          diff,
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

    let interactions = [];
    if (inferPolymorphism) {
      interactions = await Promise.all(
        ScalaJSHelpers.toJsArray(diff.interactionPointers).map(async (i) => {
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
