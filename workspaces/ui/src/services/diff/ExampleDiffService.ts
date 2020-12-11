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
  private diffResults: any[];
  private diffId?: any;
  private diffing?: AsyncIterable<any>;
  private unrecognizedUrls: any[];

  constructor(private events: string, private interactions: any[]) {}

  start() {
    const spec = DiffEngine.spec_from_events(this.events);
    this.diffId = 'example-diff';
    const diffResults = (this.diffResults = []);
    const unrecognizedUrls = (this.unrecognizedUrls = []);

    this.diffing = (async function* () {
      for (let [i, interaction] of this.interactions.entries()) {
        let results = DiffEngine.diff_interaction(
          JSON.stringify([interaction, [`${i}`]]),
          spec
        );

        let parsedResults = JSON.parse(results);

        diffResults.push(...parsedResults);

        for (let result of parsedResults) {
          yield result;
        }
        // make sure this is async so we don't block the UI thread
        await new Promise((resolve) => setTimeout(resolve));
      }
    })();

    // counting undocumented urls
    // TODO: we already have this for the cli-server side, perhaps we can re-use that logic
    // somehow.
    (async function (diffing) {
      let countsByFingerprint: Map<String, number> = new Map();
      let undocumentedUrls: Array<{
        path: string;
        method: string;
        fingerprint: string;
      }> = [];

      for await (let [diff, _, fingerprint] of diffing) {
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

      for (let { path, method, fingerprint } of undocumentedUrls) {
        let count = countsByFingerprint.get(fingerprint);
        if (!count) throw new Error('unreachable');
        unrecognizedUrls.push({ path, method, count });
      }
    })(this.diffing);

    return this.diffId;
  }

  getResults() {
    return [...this.diffResults];
  }

  getUnrecognizedUrls() {
    return [...this.unrecognizedUrls];
  }
}

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

  baseUrl = '';
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
