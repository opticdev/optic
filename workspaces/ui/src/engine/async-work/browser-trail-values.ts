import { JsonHelper, opticEngine, ScalaJSHelpers } from '@useoptic/domain';
import { IHttpInteraction } from '@useoptic/domain-types';
import {
  IValueAffordanceSerializationWithCounter,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { IDiff } from '../interfaces/diffs';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function localTrailValuesLearner(
  rfcState: any,
  pathId: string,
  method: string,
  diffs: { [key: string]: IDiff },
  interactions: any[]
): IValueAffordanceSerializationWithCounterGroupedByDiffHash {
  const learner = LearnJsonTrailAffordances.newLearner(
    pathId,
    method,
    JSON.stringify(diffs)
  );

  const undocumentedUrlHelpers = new opticEngine.com.useoptic.diff.helpers.UndocumentedUrlIncrementalHelpers(
    rfcState
  );

  function filterByEndpoint(endpoint: { pathId: string; method: string }) {
    return function (interaction: IHttpInteraction) {
      const pathId = ScalaJSHelpers.getOrUndefined(
        undocumentedUrlHelpers.tryResolvePathId(interaction.request.path)
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
        deserializedInteraction.uuid // not what we use in live versions
      );
    }
  });

  return JsonHelper.toJs(
    learner.serialize()
  ) as IValueAffordanceSerializationWithCounterGroupedByDiffHash;
}
