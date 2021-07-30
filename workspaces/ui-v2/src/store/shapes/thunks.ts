import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { JsonLike } from '@useoptic/optic-domain';
import {
  convertSpectacleChangeToChangeType,
  SpectacleChange,
} from '../spectacleUtils';
import { ShapeId, ReduxShape } from './types';
import { ChangeType } from '<src>/types';

const ShapeQuery = `
query X($shapeId: ID! $sinceBatchCommitId: String) {
  shapeChoices(shapeId: $shapeId) {
    id
    jsonType
    asObject {
      fields {
        name
        fieldId
        shapeId
        contributions
        isRemoved
        changes(sinceBatchCommitId: $sinceBatchCommitId) {
          added
          changed
          removed
        }
      }
    }
    asArray {
      shapeId
    }
  }
}`;

type SpectacleField = {
  name: string;
  fieldId: string;
  isRemoved: boolean;
  shapeId: string;
  contributions: Record<string, string>;
  changes: SpectacleChange;
};

type SpectacleArray = {
  shapeId: string;
};

type SpectacleShape =
  | {
      id: string;
      jsonType: JsonLike.OBJECT;
      asArray?: undefined;
      asObject: {
        fields: SpectacleField[];
      };
    }
  | {
      id: string;
      jsonType: JsonLike.ARRAY;
      asArray: SpectacleArray;
      asObject?: undefined;
    }
  | {
      id: string;
      jsonType: Exclude<JsonLike, JsonLike.OBJECT | JsonLike.ARRAY>;
      asArray?: undefined;
      asObject?: undefined;
    };

type SpectacleShapeResult = {
  shapeChoices: SpectacleShape[];
};

const fetchSpectacleShape = async (
  spectacle: IForkableSpectacle,
  shapeId: string,
  sinceBatchCommitId?: string
): Promise<SpectacleShapeResult> => {
  const results = await spectacle.query<
    SpectacleShapeResult,
    { shapeId: string; sinceBatchCommitId?: string }
  >({
    query: ShapeQuery,
    variables: { shapeId, sinceBatchCommitId },
  });

  if (results.errors || !results.data) {
    console.error(results.errors);
    throw new Error(JSON.stringify(results.errors));
  }

  return results.data;
};

const fetchShapesAndChildren = async (
  spectacle: IForkableSpectacle,
  rootShapeId: string,
  sinceBatchCommitId?: string
): Promise<{
  shapeMap: Record<ShapeId, ReduxShape[]>;
  changes: Record<string, ChangeType>;
}> => {
  // TODO we might want to have access to the current store to
  // avoid fetching shapes we have already fetched
  const shapeMap: Record<ShapeId, ReduxShape[]> = {};
  const changes: Record<string, ChangeType> = {};

  let stack: ShapeId[] = [rootShapeId];

  while (stack.length > 0) {
    const results = await Promise.all(
      stack.map((shapeId) =>
        fetchSpectacleShape(spectacle, shapeId, sinceBatchCommitId)
      )
    );
    // Reset the stack and add in more shapes to fetch
    stack = [];

    for (const result of results) {
      for (const shape of result.shapeChoices) {
        if (!(shape.id in shapeMap)) {
          shapeMap[shape.id] = [];
        }

        if (shape.jsonType === JsonLike.OBJECT) {
          for (const { shapeId } of shape.asObject.fields) {
            if (!(shapeId in shapeMap && !stack.includes(shape.id))) {
              stack.push(shapeId);
            }
          }

          const reduxShape: ReduxShape = {
            shapeId: shape.id,
            jsonType: JsonLike.OBJECT,
            asObject: {
              fields: shape.asObject.fields.map((field) => {
                const fieldChanges = convertSpectacleChangeToChangeType(
                  field.changes
                );
                if (sinceBatchCommitId !== undefined && fieldChanges) {
                  changes[field.fieldId] = fieldChanges;
                }

                return {
                  ...field,
                };
              }),
            },
          };
          shapeMap[shape.id].push(reduxShape);
        } else if (shape.jsonType === JsonLike.ARRAY) {
          if (
            !(
              shape.asArray.shapeId in shapeMap &&
              !stack.includes(shape.asArray.shapeId)
            )
          ) {
            stack.push(shape.asArray.shapeId);
          }

          const reduxShape: ReduxShape = {
            shapeId: shape.id,
            jsonType: JsonLike.ARRAY,
            asArray: {
              shapeId: shape.asArray.shapeId,
            },
          };
          shapeMap[shape.id].push(reduxShape);
        } else {
          const reduxShape: ReduxShape = {
            shapeId: shape.id,
            jsonType: shape.jsonType,
          };
          shapeMap[shape.id].push(reduxShape);
        }
      }
    }
  }

  return { shapeMap, changes };
};

export const fetchShapes = createAsyncThunk<
  {
    shapeMap: Record<ShapeId, ReduxShape[]>;
    changes: Record<string, ChangeType>;
  },
  {
    spectacle: IForkableSpectacle;
    rootShapeId: string;
    sinceBatchCommitId?: string;
  }
>('FETCH_SHAPES', async ({ spectacle, rootShapeId, sinceBatchCommitId }) => {
  try {
    const shapes = await fetchShapesAndChildren(
      spectacle,
      rootShapeId,
      sinceBatchCommitId
    );
    return shapes;
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
});
