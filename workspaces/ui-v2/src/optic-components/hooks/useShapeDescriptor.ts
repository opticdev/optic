import {
  IShapeRenderer,
  JsonLike,
  IArrayRender,
  IObjectRender,
} from '../shapes/ShapeRenderInterfaces';
import { SpectacleContext } from '../../spectacle-implementations/spectacle-provider';
import { useContext, useEffect, useState } from 'react';
import sortBy from 'lodash.sortby';

const shapeQuery = `
  query X($shapeId: ID) {
    shapeChoices(shapeId: $shapeId) {
      id
      jsonType
      asObject {
        fields {
          name
          fieldId
          shapeId
          contributions
        }
      }
      asArray {
        shapeId
      }
    }
}`;

const changesSinceShapeQuery = `
  query X($shapeId: ID $sinceBatchCommitId: String) {
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
          }
        }
      }
      asArray {
        shapeId
        changes(sinceBatchCommitId: $sinceBatchCommitId) {
            added
            changed
        }
      }
    }
}`;

type ShapeChoice =
  | {
      id: string;
      jsonType: JsonLike.OBJECT;
      asArray?: undefined;
      asObject: IObjectRender;
    }
  | {
      id: string;
      jsonType: JsonLike.ARRAY;
      asArray: IArrayRender;
      asObject?: undefined;
    }
  | {
      id: string;
      jsonType: Exclude<JsonLike, JsonLike.OBJECT | JsonLike.ARRAY>;
      asArray?: undefined;
      asObject?: undefined;
    };

type ShapeChoicesResult = {
  shapeChoices: ShapeChoice[];
};

export function useShapeDescriptor(
  rootShapeId: string,
  renderChangesSinceBatchCommitId: string | undefined
): IShapeRenderer[] {
  const spectacle = useContext(SpectacleContext)!;

  async function accumulateShapes(rootShapeId: string, seenSet: Set<string>) {
    //@todo figure out why some shapes loop recursively and remove those events / fix these specs
    if (seenSet.has(rootShapeId)) {
      console.warn(
        'trying to lookup shape w/ a circular reference ' + rootShapeId
      );
      return [];
    } else {
      seenSet.add(rootShapeId);
    }
    const input =
      typeof renderChangesSinceBatchCommitId !== 'undefined'
        ? {
            query: changesSinceShapeQuery,
            variables: {
              sinceBatchCommitId: renderChangesSinceBatchCommitId,
              shapeId: rootShapeId,
            },
          }
        : {
            query: shapeQuery,
            variables: {
              shapeId: rootShapeId,
            },
          };

    const result = await spectacle.query<ShapeChoicesResult>(input);

    if (result.errors) {
      console.error(result.errors);
      debugger;
    }

    if (!result.data) {
      return [];
    }
    return await Promise.all(
      result.data.shapeChoices.map(async (choice) => {
        switch (choice.jsonType) {
          case 'Object':
            const newFields = await Promise.all(
              choice.asObject.fields.map(async (field) => {
                const shapeChoices = await accumulateShapes(
                  field.shapeId,
                  seenSet
                );
                field.required = !shapeChoices.some(
                  (i) => i.jsonType === JsonLike.UNDEFINED
                ); // is required
                field.shapeChoices = shapeChoices
                  .filter((i) => i.jsonType !== JsonLike.UNDEFINED)
                  .map((i) => ({ ...i, shapeId: i.id })); // don't include optional

                field.shapeChoices = sortBy(
                  field.shapeChoices,
                  (e) => e.jsonType === JsonLike.NULL
                );
                return field;
              })
            );
            choice.asObject.fields = newFields;
            return choice;

          case 'Array':
            const results = await accumulateShapes(
              choice.asArray.shapeId,
              seenSet
            );
            const shapeChoices = await Promise.all(results);
            choice.asArray.shapeChoices = shapeChoices.map((i) => ({
              ...i,
              shapeId: i.id,
            }));
            return choice;
          default:
            return choice;
        }
      })
    );
  }

  const [x, setX] = useState<any[]>([]);
  useEffect(() => {
    async function task() {
      const seenSet: Set<string> = new Set();
      const result = await accumulateShapes(rootShapeId, seenSet);
      setX(result);
    }

    task();
    // should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spectacle, rootShapeId]);

  return x;
}
