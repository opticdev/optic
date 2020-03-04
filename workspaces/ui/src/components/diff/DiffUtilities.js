import { InteractionDiffer, toInteraction, JsQueryStringParser, PluginRegistry, QueryStringDiffer } from '@useoptic/domain';

export function getUnrecognizedUrlCount(rfcState, diffStateProjections) {
  const { sampleItemsWithoutResolvedPaths } = diffStateProjections;
  return sampleItemsWithoutResolvedPaths.length;
}

export function queryStringDiffer(shapesState, sample) {
  const parser = new JsQueryStringParser(() => {
    if (!sample.request.queryParameters) {
      console.warn('sample is missing')
      return {}
    }
    return sample.request.queryParameters
  })
  const differ = new QueryStringDiffer(shapesState, parser)
  const plugins = new PluginRegistry(differ)
  return plugins
}

export function getRequestIdsWithDiffs(rfcState, diffStateProjections) {
  const { sampleItemsWithResolvedPaths } = diffStateProjections;
  const requestIdsWithDiffs = sampleItemsWithResolvedPaths
    .filter(x => !!x.requestId)
    .filter(x => {
      const interactionDiffer = new InteractionDiffer(rfcState);
      const interaction = toInteraction(x.sample);
      return interactionDiffer.hasDiff(interaction, queryStringDiffer(rfcState.shapesState, x.sample));
    })
    .map(x => x.requestId)

  return [...new Set(requestIdsWithDiffs)];
}
