import { SerializedError } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import sortBy from 'lodash.sortby';
import { JsonType } from '@useoptic/optic-domain';

import {
  AsyncStatus,
  IShapeRenderer,
  IFieldDetails,
  QueryParameters,
} from '<src>/types';
import { RootState } from '../root';

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
        if (reduxShape.jsonType === JsonType.OBJECT) {
          return {
            ...reduxShape,
            asObject: {
              fields: reduxShape.asObject.fields.map((field) => {
                const shapeChoices = resolveShape(field.shapeId);
                const required = !shapeChoices.some(
                  (i) => i.jsonType === JsonType.UNDEFINED
                );
                return {
                  ...field,
                  shapeChoices: sortBy(
                    shapeChoices.filter(
                      (shapeChoice) =>
                        shapeChoice.jsonType !== JsonType.UNDEFINED
                    ),
                    (shapeChoice) => shapeChoice.jsonType === JsonType.NULL
                  ),
                  required,
                };
              }),
            },
          };
        } else if (reduxShape.jsonType === JsonType.ARRAY) {
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
          fieldId: field.fieldId,
          name: field.name,
          contribution: {
            id: field.fieldId,
            contributionKey: 'description',
            value: field.contributions.description || '',
            endpointId: endpointId,
          },
          depth,
          shapes: field.shapeChoices,
          required: field.required,
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

export const convertShapeToQueryParameters = (
  shapes: IShapeRenderer[]
): QueryParameters => {
  const queryParameters: QueryParameters = {};
  if (shapes.length !== 1 || !shapes[0].asObject) {
    if (shapes.length > 1) {
      console.error('unexpected format for query parameters');
    }
    // otherwise loading
    return {};
  }

  for (const field of shapes[0].asObject.fields) {
    let isArray = field.shapeChoices.findIndex(
      (choice) => choice.jsonType === JsonType.ARRAY
    );

    if (isArray > -1) {
      field.additionalAttributes = ['multiple'];
      if (field.shapeChoices.length > 1) {
        field.shapeChoices.splice(isArray, 1);
      } else {
        field.shapeChoices = field.shapeChoices[isArray].asArray!.shapeChoices;
      }
    }

    queryParameters[field.name] = field;
  }

  return queryParameters;
};
