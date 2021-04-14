import { makeUniverse } from './universes/makeUniverse';
import { DiffSet } from '../../engine/diff-set';
import { ParsedDiff } from '../../engine/parse-diff';
import sha1 from 'node-sha1';
import jsonStringify from 'json-stable-stringify';
import path from 'path';
import colors from 'colors';
import { DiffPreviewer, Queries, toOption } from '@useoptic/domain';
import { DiffRfcBaseState } from '../../engine/interfaces/diff-rfc-base-state';
import { IShapeTrail } from '../../engine/interfaces/shape-trail';
import {
  prepareNewRegionDiffSuggestionPreview,
  prepareShapeDiffSuggestionPreview,
} from '../../engine/interpreter/prepare-diff-previews';
import {
  IChangeType,
  ICopy,
  ICopyStyle,
  IDiffSuggestionPreview,
  ISuggestion,
} from '../../engine/interfaces/interpretors';
import { spawn, Thread, Worker } from 'threads';
import { JsonHelper, opticEngine, RfcCommandContext } from '@useoptic/domain';
import { ILoadInteractionResponse } from '../../services/diff';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { IDiff } from '../../engine/interfaces/diffs';
import { universeFromEvents } from '@useoptic/domain-utilities';
import * as DiffEngine from '../../../../diff-engine-wasm/engine/build';

interface ITestUniverse {
  rfcBaseState: DiffRfcBaseState;
  rawEvents: any;
  rawSamples: any;
  diffs: DiffSet;
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
}

export async function loadsDiffsFromUniverse(
  path: string
): Promise<ITestUniverse> {
  const universe_raw = require(path);
  const universePromise = makeUniverse(universe_raw);
  const {
    rawDiffs,
    rawEvents,
    rfcBaseState,
    loadInteraction,
    specService,
    learnInitial,
    learnTrailValues,
    captureId,
  } = await universePromise;
  const diffsRaw = rawDiffs;

  const diffs = new DiffSet(
    diffsRaw.map(([diff, interactions]) => {
      const diffParsed = new ParsedDiff(
        diff,
        interactions,
        sha1(jsonStringify(diff))
      );
      return diffParsed;
    }),
    rfcBaseState
  );

  return {
    diffs,
    rawEvents,
    rfcBaseState,
    loadInteraction,
    learnInitial,
    rawSamples: (await specService.listCapturedSamples(captureId)).samples,
    learnTrailValues,
  };
}

export const testCase = (basePath: string) => async (
  name: string
): Promise<ITestUniverse> => {
  return await loadsDiffsFromUniverse(
    path.join(__dirname + '/universes', basePath, name + '.json')
  );
};

export async function shapeDiffPreview(
  input: {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  },
  universe: ITestUniverse
): Promise<IDiffSuggestionPreview> {
  const { pathId, method } = input.diffs[0].location(universe.rfcBaseState);

  const trailValues = await universe.learnTrailValues(pathId, method, {
    [input.diffs[0]!.diffHash]: input.diffs[0]!.raw(),
  });
  return await prepareShapeDiffSuggestionPreview(
    input.diffs[0],
    universe,
    trailValues[input.diffs[0]!.diffHash],
    []
  );
}

export async function canApplySuggestions(
  suggestions: ISuggestion[],
  universe: ITestUniverse
) {
  function handleCommands(commands: any[], eventString: string): any[] {
    const {
      universeFromEventsAndAdditionalCommands,
    } = require('@useoptic/domain-utilities');

    const {
      StartBatchCommit,
      EndBatchCommit,
    } = opticEngine.com.useoptic.contexts.rfc.Commands;

    const inputCommands = JsonHelper.vectorToJsArray(
      opticEngine.CommandSerialization.fromJs(commands)
    );

    const commandContext = new RfcCommandContext(
      'clientId',
      'clientSessionId',
      'batchId'
    );

    const {
      rfcId,
      eventStore,
    } = universeFromEventsAndAdditionalCommands(
      JSON.parse(eventString),
      commandContext,
      [
        StartBatchCommit('batchId', 'commitMessage'),
        ...inputCommands,
        EndBatchCommit('batchId'),
      ]
    );

    const serializedEvents = JSON.parse(eventStore.serializeEvents(rfcId));

    // console.log(JSON.stringify(serializedEvents));

    const firstResponseSetShapeId = serializedEvents.find(
      (i) => i['ResponseBodySet']
    )['ResponseBodySet'].bodyDescriptor.shapeId;

    function shapeCanRender() {
      //medium confidence in this test, since it's a scalajs vestige
      const { rfcState, eventStore, rfcService, rfcId } = universeFromEvents(
        serializedEvents
      );
      const queries = Queries(eventStore, rfcService, rfcId);
      const shapesResolvers = queries.shapesResolvers();

      const previewer = new DiffPreviewer(shapesResolvers, rfcState);
      const bodyOption = toOption(firstResponseSetShapeId);
      const result = previewer.previewShape(bodyOption);
    }

    function newEventStreamHasIntegrity() {
      const spec = DiffEngine.spec_from_events(
        JSON.stringify(serializedEvents)
      );

      for (let interaction of universe.rawSamples) {
        let results = DiffEngine.diff_interaction(
          JSON.stringify(interaction),
          spec
        );
      }
    }

    shapeCanRender();
    newEventStreamHasIntegrity();

    return serializedEvents;
  }

  const events = universe.rfcBaseState.eventStore.serializeEvents(
    universe.rfcBaseState.rfcId
  );

  return Promise.all(
    suggestions.map(async (i) => {
      const commands = i.commands;
      try {
        return handleCommands(commands, events).map((i) => {
          i[Object.keys(i)[0]].eventContext = null;
          return i;
        });
      } catch (e) {
        throw new Error(
          'Count not apply commands for ' +
            e +
            '\n' +
            ICopyToConsole(i.action.activeTense) +
            '\n' +
            JSON.stringify(commands, null, 4)
        );
      }
    })
  );
}

export async function newRegionPreview(
  diff: ParsedDiff,
  universe: ITestUniverse
): Promise<IDiffSuggestionPreview> {
  const { pathId, method } = diff.location(universe.rfcBaseState);

  const initial = await universe.learnInitial(
    pathId,
    method,
    universe.rfcBaseState.domainIdGenerator
  );

  return await prepareNewRegionDiffSuggestionPreview(
    diff,
    universe,
    initial,
    []
  );
}

export function ICopyToConsole(i: ICopy[]): string {
  return i
    .map((i) =>
      i.style === ICopyStyle.Code ? colors.bgBlue(i.text) : colors.green(i.text)
    )
    .join(' ');
}

export async function logResult(preview: IDiffSuggestionPreview) {
  const toLog = [];

  toLog.push(
    `TITLE: ${colors.underline(
      ICopyToConsole(preview.overrideTitle || preview.diffDescription.title)
    )}`
  );

  toLog.push(
    `ASSERTION: ${colors.underline(
      ICopyToConsole(preview.diffDescription.assertion)
    )}`
  );
  toLog.push(
    `CHANGE TYPE: ${colors.underline(
      IChangeType[preview.diffDescription.changeType]
    )}`
  );

  preview.suggestions.map((i, index) => {
    toLog.push(
      `SUGGESTION ${index}: ${colors.underline(
        ICopyToConsole(i.action.activeTense)
      )}`
    );
    toLog.push(JSON.stringify(i.commands, null, 2));
    toLog.push('-----------------');
  });

  console.log(toLog.join('\n'));
}
