import { RootState } from '../root';
import { IContribution } from '<src>/types';
import { getEndpointId } from '<src>/utils';

// Valid changes dedupes:
// - same contribution value as already set
// - a deleted endpoint cannot have other changes
export const getValidContributions = (state: RootState): IContribution[] => {
  const { deletedEndpoints, contributions } = state.documentationEdits;
  const deletedEndpointsSet = new Set(deletedEndpoints.map(getEndpointId));
  const filteredContributions: IContribution[] = [];

  // TODO filter out contributions with the same existing contributions value
  for (const [id, idContributions] of Object.entries(contributions)) {
    for (const [contributionKey, { value, endpointId }] of Object.entries(
      idContributions
    )) {
      if (!deletedEndpointsSet.has(endpointId)) {
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
  const { deletedEndpoints } = state.documentationEdits;
  const validContributions = getValidContributions(state);

  return validContributions.length + deletedEndpoints.length;
};

export const isEndpointDeleted = ({
  pathId,
  method,
}: {
  pathId: string;
  method: string;
}) => (state: RootState) => {
  return !!state.documentationEdits.deletedEndpoints.find(
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
    !state.documentationEdits.deletedEndpoints.find(
      (endpoint) => endpoint.method === method && endpoint.pathId === pathId
    ) && state.documentationEdits.isEditing
  );
};
