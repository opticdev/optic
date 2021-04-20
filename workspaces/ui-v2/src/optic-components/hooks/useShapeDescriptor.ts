import { IShapeRenderer, JsonLike } from '../shapes/ShapeRenderInterfaces';
import { SpectacleContext } from '../../spectacle-implementations/spectacle-provider';
import { useContext, useEffect, useState } from 'react';

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

export function useShapeDescriptor(
  rootShapeId: string,
  renderChangesSinceBatchCommitId: string | undefined,
): IShapeRenderer[] {
  const spectacle = useContext(SpectacleContext)!;

  async function accumulateShapes(rootShapeId: string) {
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

    const result = await spectacle.query(input);

    if (result.errors) {
      console.error(result.errors);
      debugger;
    }

    if (!result.data.shapeChoices) {
      debugger;
    }
    return await Promise.all(
      result.data.shapeChoices.map(async (choice: any) => {
        switch (choice.jsonType) {
          case 'Object':
            const newFields = await Promise.all(
              choice.asObject.fields.map(async (field: any) => {
                const shapeChoices = await accumulateShapes(field.shapeId);
                field.required = !shapeChoices.some(
                  (i: any) => i.jsonType === JsonLike.UNDEFINED,
                ); // is required
                field.shapeChoices = shapeChoices
                  .filter((i: any) => i.jsonType !== JsonLike.UNDEFINED)
                  .map((i: any) => ({ ...i, shapeId: i.id })); // don't include optional
                return field;
              }),
            );
            choice.asObject.fields = newFields;
            return choice;

          case 'Array':
            const results = await accumulateShapes(choice.asArray.shapeId);
            const shapeChoices = await Promise.all(results);
            choice.asArray.shapeChoices = shapeChoices;
            return choice;
          default:
            return choice;
        }
      }),
    );
  }

  const [x, setX] = useState<any[]>([]);
  useEffect(() => {
    async function task() {
      const result = await accumulateShapes(rootShapeId);
      setX(result);
    }

    task();
    // should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spectacle, rootShapeId]);

  return x;
}
