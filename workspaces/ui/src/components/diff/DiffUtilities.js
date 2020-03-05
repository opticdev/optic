import {InteractionDiffer} from '@useoptic/domain';

export function getUnrecognizedUrlCount(rfcState, diffStateProjections) {
  const {sampleItemsWithoutResolvedPaths} = diffStateProjections;
  return sampleItemsWithoutResolvedPaths.length;
}

export function getRequestIdsWithDiffs(rfcState, diffStateProjections) {
  const interactionDiffer = new InteractionDiffer(rfcState);
  const {sampleItemsWithResolvedPaths} = diffStateProjections;
  const requestIdsWithDiffs = sampleItemsWithResolvedPaths
    .filter(x => !!x.requestId)
    .filter(x => {
      return interactionDiffer.hasDiff(x.sample);
    })
    .map(x => x.requestId);

  return [...new Set(requestIdsWithDiffs)];
}
