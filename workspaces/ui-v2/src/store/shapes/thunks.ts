import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { JsonLike } from '@useoptic/optic-domain';
import {
  convertSpectacleChangeToChangeType,
  SpectacleChange,
} from '../spectacleUtils';
import { ShapeId, ReduxField, ReduxShape } from './types';

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
  fieldMap: Record<string, ReduxField>;
}> => {
  // TODO we might want to have access to the current store to
  // avoid fetching shapes we have already fetched
  const shapeMap: Record<ShapeId, ReduxShape[]> = {};
  const fieldMap: Record<string, ReduxField> = {};

  let stack: ShapeId[] = [rootShapeId];

  while (stack.length > 0) {
    const results = await Promise.all(
      stack.map(async (shapeId) => ({
        result: await fetchSpectacleShape(
          spectacle,
          shapeId,
          sinceBatchCommitId
        ),
        shapeId,
      }))
    );
    // Reset the stack and add in more shapes to fetch
    stack = [];

    for (const { result, shapeId: baseShapeId } of results) {
      for (const shape of result.shapeChoices) {
        if (!(baseShapeId in shapeMap)) {
          shapeMap[baseShapeId] = [];
        }

        if (shape.jsonType === JsonLike.OBJECT) {
          const reduxFields: ReduxField[] = [];
          for (const field of shape.asObject.fields) {
            const { shapeId, fieldId } = field;
            const reduxField = {
              ...field,
              changes:
                sinceBatchCommitId !== undefined
                  ? convertSpectacleChangeToChangeType(field.changes)
                  : null,
            };
            // Continue fetching nodes in shape
            if (!(shapeId in shapeMap && !stack.includes(shape.id))) {
              stack.push(shapeId);
            }
            // Add transformed reduxField into field map and redux fields
            fieldMap[fieldId] = reduxField;
            reduxFields.push(reduxField);
          }

          const reduxShape: ReduxShape = {
            shapeId: shape.id,
            jsonType: JsonLike.OBJECT,
            asObject: {
              fields: reduxFields,
            },
          };
          shapeMap[baseShapeId].push(reduxShape);
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
          shapeMap[baseShapeId].push(reduxShape);
        } else {
          const reduxShape: ReduxShape = {
            shapeId: shape.id,
            jsonType: shape.jsonType,
          };
          shapeMap[baseShapeId].push(reduxShape);
        }
      }
    }
  }

  return { shapeMap, fieldMap };
};

export const fetchShapes = createAsyncThunk<
  {
    shapeMap: Record<ShapeId, ReduxShape[]>;
    fieldMap: Record<string, ReduxField>;
  },
  {
    spectacle: IForkableSpectacle;
    rootShapeId: string;
    sinceBatchCommitId?: string;
  }
>('FETCH_SHAPES', async ({ spectacle, rootShapeId, sinceBatchCommitId }) => {
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
