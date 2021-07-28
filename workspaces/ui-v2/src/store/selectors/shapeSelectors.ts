import { SerializedError } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import sortBy from 'lodash.sortby';

import {
  AsyncStatus,
  IShapeRenderer,
  IFieldDetails,
  JsonLike,
} from '<src>/types';
import { RootState } from '../root';

// TODO write a test for this
export const getShapeRenderer = (rootShapeId: string) => (
  state: RootState
): AsyncStatus<IShapeRenderer[], SerializedError> => {
  const shapeState = state.shapes.rootShapes[rootShapeId];

  if (!shapeState || shapeState.loading) {
    return {
      loading: true,
    };
  } else if (shapeState.error) {
    return {
      loading: false,
      error: shapeState.error,
    };
  }

  const resolveShape = (shapeId: string): IShapeRenderer[] => {
    const reduxShapes = state.shapes.shapeMap[shapeId];
    if (!reduxShapes || reduxShapes.length === 0) {
      // TODO sentry and console error
      console.error(`Could not find shape ${shapeId} in redux store`);
      Sentry.captureEvent({
        message: 'Could not find shape in redux store',
        extra: {
          shapes: state.shapes,
        },
      });
      return [];
    }

    return reduxShapes.map(
      (reduxShape): IShapeRenderer => {
        if (reduxShape.jsonType === JsonLike.OBJECT) {
          return {
            ...reduxShape,
            asObject: {
              fields: reduxShape.asObject.fields.map((field) => {
                const shapeChoices = resolveShape(field.shapeId);
                const required = !shapeChoices.some(
                  (i) => i.jsonType === JsonLike.UNDEFINED
                );
                return {
                  ...field,
                  shapeChoices: sortBy(
                    shapeChoices.filter(
                      (shapeChoice) =>
                        shapeChoice.jsonType !== JsonLike.UNDEFINED
                    ),
                    (shapeChoice) => shapeChoice.jsonType === JsonLike.NULL
                  ),
                  required,
                };
              }),
            },
          };
        } else if (reduxShape.jsonType === JsonLike.ARRAY) {
          return {
            ...reduxShape,
            asArray: {
              shapeId: reduxShape.asArray.shapeId,
              shapeChoices: resolveShape(reduxShape.asArray.shapeId),
            },
          };
        } else {
          return {
            ...reduxShape,
          };
        }
      }
    );
  };

  return {
    loading: false,
    data: resolveShape(rootShapeId),
  };
};

export function createFlatList(
  shapes: IShapeRenderer[],
  endpointId: string,
  depth: number = 0
): IFieldDetails[] {
  const fieldDetails: IFieldDetails[] = [];

  shapes.forEach((shape) => {
    if (shape.asObject) {
      shape.asObject.fields.forEach((field) => {
        fieldDetails.push({
          name: field.name,
          contribution: {
            id: field.fieldId,
            contributionKey: 'description',
            value: field.contributions.description || '',
            endpointId: endpointId,
          },
          depth,
          shapes: field.shapeChoices,
        });

        fieldDetails.push(
          ...createFlatList(field.shapeChoices, endpointId, depth + 1)
        );
      });
    }
    if (shape.asArray) {
      fieldDetails.push(
        ...createFlatList(shape.asArray.shapeChoices, endpointId, depth + 1)
      );
    }
  });

  return fieldDetails;
}
