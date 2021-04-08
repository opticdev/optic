import { IShapeRenderer, JsonLike } from '../shapes/ShapeRenderInterfaces';
import { SpectacleContext } from '../../spectacle-implementations/spectacle-provider';
import { useContext, useEffect, useState } from 'react';

export function useShapeDescriptor(
  rootShapeId: string,
  renderChangesSince: string | undefined
): IShapeRenderer[] {
  const spectacle = useContext(SpectacleContext)!;

  const query = `
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

  async function accumulateShapes(rootShapeId: string) {
    const result = await spectacle!.query({
      variables: {
        shapeId: rootShapeId,
      },
      query,
    });

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
                  (i: any) => i.jsonType === JsonLike.UNDEFINED
                ); // is required
                field.shapeChoices = shapeChoices.filter(
                  (i: any) => i.jsonType !== JsonLike.UNDEFINED
                ); // don't include optional
                return field;
              })
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
      })
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
  }, [spectacle]);

  return x;
}
