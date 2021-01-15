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
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/browser';
import {
  DiffResultHelper,
  JsonHelper,
  RfcCommandContext,
  ScalaJSHelpers,
  UrlCounterHelper,
} from '@useoptic/domain/build';
import uuidv4 from 'uuid/v4';
import { getOrUndefined, opticEngine } from '@useoptic/domain';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { localInitialBodyLearner } from '../../components/diff/review-diff/learn-api/browser-initial-body';
import { IDiff } from '../../engine/interfaces/diffs';
import { localTrailValuesLearner } from '../../engine/async-work/browser-trail-values';
import { AsyncTools, Streams } from '@useoptic/diff-engine-wasm';

export class ExampleDiff {
  private diffId?: any;
  private diffing?: Promise<any[]>;

  start(events: any[], interactions: any[]) {
    const spec = DiffEngine.spec_from_events(JSON.stringify(events));
    this.diffId = uuidv4();

    const diffingStream = (async function* (): AsyncIterable<
      Streams.DiffResults.DiffResult
    > {
      for (let interaction of interactions) {
        let results = DiffEngine.diff_interaction(
          JSON.stringify(interaction),
          spec
        );

        let parsedResults = JSON.parse(results);
        let taggedResults = (parsedResults = parsedResults.map(
          ([diffResult, fingerprint]) => [
            diffResult,
            [interaction.uuid],
            fingerprint,
          ]
        ));

        for (let result of taggedResults) {
          yield result;
        }
        // make sure this is async so we don't block the UI thread
        await new Promise((resolve) => setTimeout(resolve));
      }
    })();

    // Consume stream instantly for now, resulting in a Promise that resolves once exhausted
    this.diffing = AsyncTools.toArray(diffingStream);

    return this.diffId;
  }

  async getNormalizedDiffs() {
    // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
    // allowing only a single consumer, and we need multiple (results themselves + urls)!
    const diffResults = AsyncTools.from(await this.diffing);

    const normalizedDiffs = Streams.DiffResults.normalize(diffResults);
    const lastUniqueResults = Streams.DiffResults.lastUnique(normalizedDiffs);

    return AsyncTools.toArray(lastUniqueResults);
  }

  async getUnrecognizedUrls() {
    // Q: Why not consume diff stream straight up? A: we don't have a way to fork streams yet
    // allowing only a single consumer, and we need multiple (results themselves + urls)!
    const diffResults = AsyncTools.from(await this.diffing);

    const undocumentedUrls = Streams.UndocumentedUrls.fromDiffResults(
      diffResults
    );
    const lastUnique = Streams.UndocumentedUrls.lastUnique(undocumentedUrls);

    return AsyncTools.toArray(lastUnique);
  }
}

export class ExampleCaptureService implements ICaptureService {
  constructor(
    private specService: ISpecService,
    private exampleDiff: ExampleDiff
  ) {}

  async startDiff(
    events: any[],
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[],
    filters: { pathId: string; method: string }[]
  ): Promise<IStartDiffResponse> {
    const capture = await this.specService.listCapturedSamples(captureId);
    const diffId = await this.exampleDiff.start(events, capture.samples);

    return {
      diffId,
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

  baseUrl = '';
}

export class ExampleDiffService implements IDiffService {
  constructor(
    private exampleDiff: ExampleDiff,
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
    const diffsJson = (await this.exampleDiff.getNormalizedDiffs()).map(
      ([diff, tags]) => {
        return [diff, tags];
      }
    );

    const diffs = opticEngine.DiffWithPointersJsonDeserializer.fromJs(
      diffsJson
    );

    const endpointDiffs = ScalaJSHelpers.toJsArray(
      DiffResultHelper.endpointDiffs(diffs, this.rfcState)
    );

    return Promise.resolve({ diffs: endpointDiffs, rawDiffs: diffsJson });
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const urls = (await this.exampleDiff.getUnrecognizedUrls()).map(
      ({ fingerprint, ...rest }) => {
        return rest;
      }
    );

    const result = UrlCounterHelper.fromJsonToSeq(urls, this.rfcState);
    return Promise.resolve({ result, raw: urls });
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

  async learnInitial(
    rfcService: any,
    rfcId: any,
    pathId: string,
    method: string,
    opticIds: any = undefined
  ): Promise<ILearnedBodies> {
    const capture = await this.specService.listCapturedSamples(captureId);
    const interactions = capture.samples;

    const rfcState = rfcService.currentState(rfcId);

    return localInitialBodyLearner(
      rfcState,
      pathId,
      method,
      interactions,
      opticIds
    );
  }

  async learnTrailValues(
    rfcService: any,
    rfcId: any,
    pathId: string,
    method: string,
    diffs: { [key: string]: IDiff }
  ): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
    const capture = await this.specService.listCapturedSamples(captureId);
    const interactions = capture.samples;

    const rfcState = rfcService.currentState(rfcId);

    return localTrailValuesLearner(
      rfcState,
      pathId,
      method,
      diffs,
      interactions
    );
  }
}
