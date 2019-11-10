import {InteractionDiffer, toInteraction} from '../../engine';

export function getUnrecognizedUrlCount(rfcState, diffStateProjections) {
  const {sampleItemsWithoutResolvedPaths, sampleItemsWithResolvedPaths} = diffStateProjections;
  return sampleItemsWithoutResolvedPaths.length + sampleItemsWithResolvedPaths.filter(x => !x.requestId).length;
}

export function getRequestIdsWithDiffs(rfcState, diffStateProjections) {
  const interactionDiffer = new InteractionDiffer(rfcState);
  const {sampleItemsWithResolvedPaths} = diffStateProjections;
  const requestIdsWithDiffs = sampleItemsWithResolvedPaths
    .filter(x => !!x.requestId)
    .filter(x => {
      const interaction = toInteraction(x.sample);
      return interactionDiffer.hasDiff(interaction);
    })
    .map(x => x.requestId)

  return [...new Set(requestIdsWithDiffs)];
}
