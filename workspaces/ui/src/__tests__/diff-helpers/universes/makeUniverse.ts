import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';
import {
  DiffHelpers,
  Facade,
  JsonHelper,
  opticEngine,
  RfcCommandContext,
} from '@useoptic/domain';
import { universeFromEvents } from '@useoptic/domain-utilities';
import { createExampleSpecServiceFactory } from '../../../components/loaders/ApiLoader';
import { ILoadInteractionResponse } from '../../../services/diff';
import { AsyncTools, Streams } from '@useoptic/diff-engine-wasm';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { localInitialBodyLearner } from '../../../components/diff/review-diff/learn-api/browser-initial-body';
import { localTrailValuesLearner } from '../../../engine/async-work/browser-trail-values';
import {
  DiffRfcBaseState,
  makeDiffRfcBaseState,
} from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';
import { IDiff } from '@useoptic/cli-shared/build/diffs/diffs';

export async function makeUniverse(
  json: any
): Promise<{
  specService: any;
  rawDiffs: any[];
  rawEvents: any[];
  captureId: string;
  rfcBaseState: DiffRfcBaseState;
  jsonUniverse: any;
  loadInteraction: (pointer: string) => Promise<ILoadInteractionResponse>;
  learnInitial(
    pathId: string,
    method: string,
    opticIds: any
  ): Promise<ILearnedBodies>;
  learnTrailValues(
    pathId: string,
    method: string,
    diffs: { [key: string]: IDiff }
  ): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash>;
}> {
  const { specService } = await createExampleSpecServiceFactory(json);
  const captureId = 'simulated';
  const capture = await specService.listCapturedSamples(captureId);
  const events = JSON.parse(await specService.listEvents());
  async function newDiff() {
    const spec = DiffEngine.spec_from_events(JSON.stringify(events));
    const diffingStream = (async function* (): AsyncIterable<
      Streams.DiffResults.DiffResult
    > {
      for (let interaction of capture.samples) {
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
    return AsyncTools.toArray(diffingStream);
  }

  //normalize it? we don't handle diff hash here yet
  const diffs = (await newDiff()).map((i) => {
    return [i[0], i[1]];
  });

  const commandContext = new RfcCommandContext(
    'simulated',
    'simulated',
    'simulated'
  );

  const { eventStore, rfcId, rfcService } = universeFromEvents(events);

  const opticIds = opticEngine.com.useoptic.OpticIdsJsHelper().deterministic;

  const rfcBaseState = makeDiffRfcBaseState(
    eventStore,
    rfcService,
    rfcId,
    opticIds
  );

  return {
    rawDiffs: diffs,
    rawEvents: events,
    rfcBaseState,
    jsonUniverse: json,
    captureId,
    specService,
    loadInteraction: async (interactionPointer) => {
      const interaction = capture.samples.find(
        (x: IHttpInteraction) => x.uuid === interactionPointer
      );
      return {
        interaction,
      };
    },
    learnInitial: async (
      pathId: string,
      method: string,
      opticIds: any = undefined
    ) => {
      return localInitialBodyLearner(
        rfcBaseState.rfcState,
        pathId,
        method,
        capture.samples,
        opticIds
      );
    },
    learnTrailValues: async (
      pathId: string,
      method: string,
      diffs: { [key: string]: IDiff }
    ) => {
      return localTrailValuesLearner(
        rfcBaseState.rfcState,
        pathId,
        method,
        diffs,
        capture.samples
      );
    },
  };
}
