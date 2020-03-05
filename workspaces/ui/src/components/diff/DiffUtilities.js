import {InteractionDiffer, JsonHelper} from '@useoptic/domain';

export function getUnrecognizedUrlCount(rfcState, diffStateProjections) {
  const {sampleItemsWithoutResolvedPaths} = diffStateProjections;
  return new Set(sampleItemsWithoutResolvedPaths).size;
}

export function getRequestIdsWithDiffs(rfcState, diffStateProjections) {
  const interactionDiffer = new InteractionDiffer(rfcState);
  const {sampleItemsWithResolvedPaths} = diffStateProjections;
  const requestIdsWithDiffs = sampleItemsWithResolvedPaths
    .filter(x => {
      const interaction = JsonHelper.fromInteraction(x.sample);
      console.log(x, interactionDiffer.hasDiff(interaction));
      return interactionDiffer.hasDiff(interaction);
    })
    .map(x => xToKey(x));
  return [...new Set(requestIdsWithDiffs)];
}

export function xToKey(x) {
  return JSON.stringify({pathId: x.pathId, method: x.sample.request.method});
}

export function keyToX(key) {
  return JSON.parse(key);
}
