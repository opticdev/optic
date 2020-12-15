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
import * as DiffEngine from '@useoptic/diff-engine-wasm/browser';
import uuidv4 from 'uuid/v4';
import { getOrUndefined, opticEngine } from '@useoptic/domain';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { localInitialBodyLearner } from '../../components/diff/v2/learn-api/browser-initial-body';

export class ExampleDiff {
  private diffId?: any;
  private diffing?: Promise<any[]>;

  start(events: any[], interactions: any[]) {
    const spec = DiffEngine.spec_from_events(JSON.stringify(events));
    this.diffId = uuidv4();

    const diffingStream = (async function* () {
      for (let [i, interaction] of interactions.entries()) {
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
    this.diffing = (async function (diffing) {
      const diffs = [];
      for await (let diff of diffing) {
        diffs.push(diff);
      }

      return diffs;
    })(diffingStream);

    return this.diffId;
  }

  async getNormalizedDiffs() {
    const diffResults = await this.diffing;

    let pointersByFingerprint: Map<String, string[]> = new Map();
    let diffs: [any, string][] = [];
    let results: [any, string[]][] = [];

    for (let [diff, pointers, fingerprint] of diffResults) {
      if (!fingerprint) results.push([diff, pointers]);

      let existingPointers = pointersByFingerprint.get(fingerprint) || [];
      if (existingPointers.length < 1) {
        diffs.push([diff, fingerprint]);
      }
      pointersByFingerprint.set(fingerprint, existingPointers.concat(pointers));
    }

    for (let [diff, fingerprint] of diffs) {
      let pointers = pointersByFingerprint.get(fingerprint);
      if (!pointers) throw new Error('unreachable');
      results.push([diff, pointers]);
    }

    return results;
  }

  async getUnrecognizedUrls() {
    const diffResults = await this.diffing;

    let countsByFingerprint: Map<String, number> = new Map();
    let undocumentedUrls: Array<{
      path: string;
      method: string;
      fingerprint: string;
    }> = [];

    for (let [diff, _, fingerprint] of diffResults) {
      let urlDiff = diff['UnmatchedRequestUrl'];
      if (!urlDiff || !fingerprint) continue;

      let existingCount = countsByFingerprint.get(fingerprint) || 0;
      if (existingCount < 1) {
        let path = urlDiff.interactionTrail.path.find(
          (interactionComponent: any) =>
            interactionComponent.Url && interactionComponent.Url.path
        ).Url.path as string;
        let method = urlDiff.interactionTrail.path.find(
          (interactionComponent: any) =>
            interactionComponent.Method && interactionComponent.Method.method
        ).Method.method as string;

        undocumentedUrls.push({ path, method, fingerprint });
      }
      countsByFingerprint.set(fingerprint, existingCount + 1);
    }

    return undocumentedUrls.map(({ path, method, fingerprint }) => {
      let count = countsByFingerprint.get(fingerprint);
      if (!count) throw new Error('unreachable');
      return { path, method, count };
    });
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
    const diffsJson = await this.exampleDiff.getNormalizedDiffs();

    const diffs = opticEngine.DiffWithPointersJsonDeserializer.fromJs(
      diffsJson
    );

    const endpointDiffs = ScalaJSHelpers.toJsArray(
      DiffResultHelper.endpointDiffs(diffs, this.rfcState)
    );

    return Promise.resolve({ diffs: endpointDiffs });
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const urls = await this.exampleDiff.getUnrecognizedUrls();
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

  async learnInitial(
    rfcService: any,
    rfcId: any,
    pathId: string,
    method: string
  ): Promise<ILearnedBodies> {
    const capture = await this.specService.listCapturedSamples(captureId);
    const interactions = capture.samples;

    const rfcState = rfcService.currentState(rfcId);

    return localInitialBodyLearner(rfcState, pathId, method, interactions);
  }
}
