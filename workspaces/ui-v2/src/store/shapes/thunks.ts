import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { JsonLike, ChangeType } from '<src>/types';
import { ShapeId, ReduxShape } from './types';

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

// TODO move this to shared file
type SpectacleChange = {
  added?: boolean;
  changed?: boolean;
  removed?: boolean;
};

// TODO move this to shared file
const convertSpectacleChangeToChangeType = (
  spectacleChange: SpectacleChange
): ChangeType | null =>
  spectacleChange.added
    ? 'added'
    : spectacleChange.changed
    ? 'updated'
    : spectacleChange.removed
    ? 'removed'
    : null;

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
): Promise<Record<ShapeId, ReduxShape[]>> => {
  const shapeMap: Record<ShapeId, ReduxShape[]> = {};

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
              fields: shape.asObject.fields.map((field) => ({
                ...field,
                changes:
                  sinceBatchCommitId !== undefined
                    ? convertSpectacleChangeToChangeType(field.changes)
                    : null,
              })),
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

  return shapeMap;
};

export const fetchShapes = createAsyncThunk<
  Record<ShapeId, ReduxShape[]>,
  {
    spectacle: IForkableSpectacle;
    rootShapeId: string;
    sinceBatchCommitId?: string;
  }
>('FETCH_PATHS', async ({ spectacle, rootShapeId, sinceBatchCommitId }) => {
  try {
    const shapeMap = await fetchShapesAndChildren(
      spectacle,
      rootShapeId,
      sinceBatchCommitId
    );
    return shapeMap;
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
});
