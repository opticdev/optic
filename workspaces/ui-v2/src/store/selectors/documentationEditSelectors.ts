import { RootState } from '../root';
import { IContribution } from '<src>/types';
import { getEndpointId } from '<src>/utils';

// Valid changes dedupes:
// - same contribution value as already set
// - a deleted endpoint cannot have other changes
export const getValidContributions = (state: RootState): IContribution[] => {
  const { removedEndpoints, contributions } = state.documentationEdits;
  const removedEndpointsSet = new Set(removedEndpoints.map(getEndpointId));
  const filteredContributions: IContribution[] = [];

  // TODO filter out contributions with the same existing contributions value
  for (const [id, idContributions] of Object.entries(contributions)) {
    for (const [contributionKey, { value, endpointId }] of Object.entries(
      idContributions
    )) {
      if (!removedEndpointsSet.has(endpointId)) {
        filteredContributions.push({
          id,
          contributionKey,
          value,
          endpointId,
        });
      }
    }
  }

  return filteredContributions;
};

export const getDocumentationEditStagedCount = (state: RootState) => {
  const { removedEndpoints } = state.documentationEdits;
  const validContributions = getValidContributions(state);

  return validContributions.length + removedEndpoints.length;
};

export const isEndpointDeleted = ({
  pathId,
  method,
}: {
  pathId: string;
  method: string;
}) => (state: RootState) => {
  return !!state.documentationEdits.removedEndpoints.find(
    (endpoint) => endpoint.method === method && endpoint.pathId === pathId
  );
};

export const isEndpointEditable = ({
  pathId,
  method,
}: {
  pathId: string;
  method: string;
}) => (state: RootState) => {
  return (
    !state.documentationEdits.removedEndpoints.find(
      (endpoint) => endpoint.method === method && endpoint.pathId === pathId
    ) && state.documentationEdits.isEditing
  );
};
