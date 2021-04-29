import { JsonHelper, opticEngine, ScalaJSHelpers } from '@useoptic/domain';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { IDiff } from '@useoptic/cli-shared/build/diffs/diffs';
import { universeFromEvents } from '@useoptic/domain-utilities';
import { ParsedDiff } from '../parse-diff';
import { DiffSet } from '../diff-set';
import { CurrentSpecContext } from '../Interfaces';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function learnTrailsForParsedDiffs(
  parsedDiffs: ParsedDiff[],
  currentSpecContext: CurrentSpecContext,
  events: any[],
  allInteractions: any[],
) {
  const diffSet = new DiffSet(parsedDiffs, currentSpecContext);
  const groupings = Object.values(diffSet.groupedByEndpoint());

  let allResults = {};

  groupings.forEach((i) => {
    const { diffs, pathId, method } = i;
    new DiffSet(diffs, currentSpecContext)
      .groupedByEndpointAndShapeTrail()
      .forEach((i) => {
        const result = { [i.diffs[0].diffHash]: i.diffs[0].raw() };
        allResults = {
          ...allResults,
          ...localTrailValuesLearner(
            events,
            pathId,
            method,
            result,
            allInteractions,
          ),
        };
      });
  });

  return allResults;
}

export function localTrailValuesLearner(
  events: any[],
  pathId: string,
  method: string,
  diffs: { [key: string]: IDiff },
  interactions: any[],
): IValueAffordanceSerializationWithCounterGroupedByDiffHash {
  const learner = LearnJsonTrailAffordances.newLearner(
    pathId,
    method,
    JSON.stringify(diffs),
  );

  const { rfcState } = universeFromEvents(events);

  const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
    rfcState,
  );

  function filterByEndpoint(endpoint: { pathId: string; method: string }) {
    return function (interaction: any) {
      const pathId = ScalaJSHelpers.getOrUndefined(
        undocumentedUrlHelpers.tryResolvePathId(interaction.request.path),
      );
      return (
        endpoint.method === interaction.request.method &&
        endpoint.pathId === pathId
      );
    };
  }

  const filter = filterByEndpoint({ pathId, method });

  interactions.forEach((i) => {
    const deserializedInteraction = JsonHelper.fromInteraction(i);
    if (filter(i)) {
      // only learn if it matches the endpoint
      learner.learnBody(
        deserializedInteraction,
        deserializedInteraction.uuid, // not what we use in live versions
      );
    }
  });

  return JsonHelper.toJs(
    learner.serialize(),
  ) as IValueAffordanceSerializationWithCounterGroupedByDiffHash;
}
