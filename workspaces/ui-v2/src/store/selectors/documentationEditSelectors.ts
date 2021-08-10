import { createSelector } from 'reselect';
import { RootState } from '../root';
import { IContribution } from '<src>/types';
import { getEndpointId } from '<src>/utils';
import { JsonType } from '@useoptic/optic-domain';

const memoizedGetAllRemovedFields = createSelector<
  RootState,
  RootState['shapes'],
  string[],
  Set<string>
>(
  (state) => state.shapes,
  (state) => state.documentationEdits.fields.removed,
  (shapes, removedFields) => {
    const allRemovedFields = new Set<string>();
    for (const fieldId of removedFields) {
      allRemovedFields.add(fieldId);
      const stack = [shapes.fieldMap[fieldId].shapeId];
      while (stack.length > 0) {
        const shapeId = stack.pop()!;
        const reduxShapes = shapes.shapeMap[shapeId];
        for (const shape of reduxShapes) {
          if (shape.jsonType === JsonType.OBJECT) {
            for (const field of shape.asObject.fields) {
              stack.push(field.shapeId);
              allRemovedFields.add(field.fieldId);
            }
          } else if (shape.jsonType === JsonType.ARRAY) {
            stack.push(shape.asArray.shapeId);
          }
        }
      }
    }

    return allRemovedFields;
  }
);

// Valid changes dedupes:
// - same contribution value as already set
// - a deleted endpoint cannot have other changes
export const getValidContributions = (state: RootState): IContribution[] => {
  const { removedEndpoints, contributions } = state.documentationEdits;
  const removedEndpointsSet = new Set(removedEndpoints.map(getEndpointId));
  const filteredContributions: IContribution[] = [];

  const removedFields = memoizedGetAllRemovedFields(state);

  for (const [id, idContributions] of Object.entries(contributions)) {
    for (const [contributionKey, { value, endpointId }] of Object.entries(
      idContributions
    )) {
      // TODO filter out contributions that have the same initial value
      const isContributionsForRemovedEndpoint = removedEndpointsSet.has(
        endpointId
      );
      const isContributionForRemovedField = removedFields.has(id);

      if (
        !isContributionsForRemovedEndpoint &&
        !isContributionForRemovedField
      ) {
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
  const {
    removedEndpoints,
    fields: { removed: removedFields },
  } = state.documentationEdits;
  const validContributions = getValidContributions(state);

  return (
    validContributions.length + removedEndpoints.length + removedFields.length
  );
};

export const isEndpointRemoved = ({
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

export const isFieldRemoved = (fieldId: string) => (state: RootState) => {
  const memoizedFields = memoizedGetAllRemovedFields(state);

  return memoizedFields.has(fieldId);
};

export const isFieldRemovedRoot = (fieldId: string) => (
  state: RootState
): boolean => {
  return !!state.documentationEdits.fields.removed.find(
    (removedFieldId) => removedFieldId === fieldId
  );
};

export const isEndpointFieldEditable = ({
  pathId,
  method,
  fieldId,
}: {
  pathId: string;
  method: string;
  fieldId: string;
}) => (state: RootState) => {
  return (
    isEndpointEditable({ pathId, method })(state) &&
    !isFieldRemoved(fieldId)(state)
  );
};
