import { RootState } from '../root';

// Valid changes dedupes:
// - same contribution value as already set
// - a deleted endpoint cannot have other changes
export const getDocumentationEditStagedCount = (state: RootState) => {
  const { deletedEndpoints, contributions } = state.documentationEdits;
  const deletedEndpointsSet = new Set(deletedEndpoints);

  const filteredContributions = contributions.filter(
    (contribution) => !deletedEndpointsSet.has(contribution.endpointId)
  );

  return filteredContributions.length + deletedEndpoints.length;
};
