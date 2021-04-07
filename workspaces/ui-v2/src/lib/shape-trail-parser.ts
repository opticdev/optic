import {
  IListItemTrail,
  IListTrail,
  IObjectFieldTrail,
  IObjectTrail,
  IOneOfItemTrail,
  IShapeTrail,
  IShapeTrailComponent,
} from '@useoptic/cli-shared/build/diffs/shape-trail';
import { JsonLike } from '../optic-components/shapes/ShapeRenderInterfaces';
import invariant from 'invariant';
import { ICoreShapeKinds } from './Interfaces';

export interface IExpectationHelper {
  allowedCoreShapes: string[];
  allowedCoreShapeKindsByShapeId: { [key: string]: ICoreShapeKinds };
  lastField?: string;
  lastFieldKey?: string;
  lastFieldShapeId?: string;
  fieldIsOptional?: boolean;
  lastObject?: string;
  lastList?: string;
  lastListItem?: string;
  rootShapeId?: string;
  shapeName?: string;
}

export async function shapeTrailParserLastId(
  shapeTrail: IShapeTrail,
  spectacle: any
): Promise<IExpectationHelper> {
  const lastTrail: IShapeTrailComponent =
    shapeTrail.path[shapeTrail.path.length - 1];

  if (lastTrail) {
    if (lastTrail.hasOwnProperty('ObjectTrail')) {
      const shapeId = (lastTrail as IObjectTrail).ObjectTrail.shapeId;
      const choices = await getChoices(shapeId, spectacle);
      const lastObjectOption = Object.entries(
        choices.allowedCoreShapeKindsByShapeId
      ).find(([key, value]) => value === ICoreShapeKinds.ObjectKind);

      return {
        lastObject: lastObjectOption ? lastObjectOption[0] : undefined,
        ...choices,
      };
    }

    if (lastTrail.hasOwnProperty('OneOfItemTrail')) {
      const shapeId = (lastTrail as IOneOfItemTrail).OneOfItemTrail.itemShapeId;
      const choices = await getChoices(shapeId, spectacle);
      return {
        ...choices,
      };
    }

    if (lastTrail.hasOwnProperty('ObjectFieldTrail')) {
      const fieldTrail = (lastTrail as IObjectFieldTrail).ObjectFieldTrail;

      const field = await getFieldFromRootShapeId(
        shapeTrail.rootShapeId,
        fieldTrail.fieldId,

        spectacle
      );
      const choices = await getChoices(fieldTrail.fieldShapeId, spectacle);
      return {
        lastField: fieldTrail.fieldId,
        lastFieldShapeId: fieldTrail.fieldShapeId,
        lastFieldKey: field.name,
        fieldIsOptional: choices.allowedCoreShapes.includes(
          ICoreShapeKinds.OptionalKind
        ),
        ...choices,
      };
    }

    if (lastTrail.hasOwnProperty('ListTrail')) {
      const shapeId = (lastTrail as IListTrail).ListTrail.shapeId;
      const choices = await getChoices(shapeId, spectacle);

      return {
        lastList: shapeId,
        ...choices,
      };
    }

    if (lastTrail.hasOwnProperty('ListItemTrail')) {
      const listItemTrail = (lastTrail as IListItemTrail).ListItemTrail;
      const choices = await getChoices(listItemTrail.itemShapeId, spectacle);
      return {
        lastList: listItemTrail.listShapeId,
        lastListItem: listItemTrail.itemShapeId,
        ...choices,
      };
    }
    //
    // if (lastTrail.hasOwnProperty('NullableTrail')) {
    //   const shapeId = (lastTrail as INullableTrail).NullableTrail.shapeId;
    //   const choices = await getChoices(shapeId, query);
    //   return {
    //     ...choices,
    //   };
    // }
    //
    // if (lastTrail.hasOwnProperty('OptionalItemTrail')) {
    //   const shapeId = (lastTrail as IOptionalItemTrail).OptionalItemTrail
    //     .shapeId;
    //   const choices = await getChoices(shapeId, query);
    //   return {
    //     ...choices,
    //   };
    // }
    //
    // if (lastTrail.hasOwnProperty('NullableItemTrail')) {
    //   const shapeId = (lastTrail as INullableItemTrail).NullableItemTrail
    //     .innerShapeId;
    //   const choices = await getChoices(shapeId, query);
    // }

    //
    // if (lastTrail['UnknownTrail']) {
    //   const shapeId = (lastTrail as IUnknownTrail).UnknownTrail || 'unknown';
    //   getChoices(shapeId, query);
    // }
    //
    // if (lastTrail['OneOfTrail']) {
    //   const shapeId = (lastTrail as IOneOfTrail).OneOfTrail.shapeId;
    //   getChoices(shapeId, query);
    // }
    //
    // if (lastTrail['OptionalTrail']) {
    //   const shapeId = (lastTrail as IOptionalTrail).OptionalTrail.shapeId;
    //   getChoices(shapeId, query);
    // }
    invariant(true, 'shape trail could not be parsed');
  } else {
    const choices = await getChoices(shapeTrail.rootShapeId, spectacle);
    return {
      ...choices,
      rootShapeId: shapeTrail.rootShapeId,
    };
  }

  invariant(true, 'shape trail could not be parsed');
  return {
    allowedCoreShapeKindsByShapeId: {},
    allowedCoreShapes: [],
  };
}

async function getChoices(
  shapeId: string,
  spectacle: any
): Promise<{
  allowedCoreShapes: string[];
  allowedCoreShapeKindsByShapeId: { [key: string]: ICoreShapeKinds };
}> {
  const query = `
  query X($shapeId: ID) {
    shapeChoices(shapeId: $shapeId) {
      id
      jsonType
    }
}`;

  const result = await spectacle.query({
    variables: {
      shapeId: shapeId,
    },
    query,
  });

  if (result.data) {
    const shapeChoices: {
      id: string;
      coreShapeKind: ICoreShapeKinds;
    }[] = JsonLikeToCoreShapeKinds(result.data.shapeChoices);

    const allowedCoreShapeKindsByShapeId: {
      [key: string]: ICoreShapeKinds;
    } = {};
    shapeChoices.forEach(
      (i) => (allowedCoreShapeKindsByShapeId[i.id] = i.coreShapeKind)
    );

    return {
      allowedCoreShapeKindsByShapeId,
      allowedCoreShapes: shapeChoices.map((i) => i.coreShapeKind),
    };
  } else {
    return { allowedCoreShapeKindsByShapeId: {}, allowedCoreShapes: [] };
  }
}

// @todo this should be changed to use a field query
async function getFieldFromRootShapeId(
  rootShapeId: string,
  fieldId: string,
  spectacle: any
): Promise<{ fieldId: string; shapeId: string; name: string }> {
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

  const fields: {
    [key: string]: { fieldId: string; shapeId: string; name: string };
  } = {};

  async function accumulateShapes(rootShapeId: string) {
    const result = await spectacle.query({
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
            const newFields: {
              fieldId: string;
              name: string;
              shapeId: string;
            }[] = await Promise.all(
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
            //store fields in dictionary
            newFields.forEach((i) => (fields[i.fieldId] = i));

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

  await accumulateShapes(rootShapeId);

  return fields[fieldId]!;
}

export function JsonLikeToCoreShapeKinds(
  jsonLikes: { id: string; jsonType: JsonLike }[]
): { id: string; coreShapeKind: ICoreShapeKinds }[] {
  //@todo talk about how we will handle todos
  if (jsonLikes.length === 0) {
    return [];
  }

  function toCoreShapeKind(jsonLike: JsonLike): ICoreShapeKinds {
    switch (jsonLike) {
      case JsonLike.OBJECT:
        return ICoreShapeKinds.ObjectKind;
      case JsonLike.STRING:
        return ICoreShapeKinds.StringKind;
      case JsonLike.BOOLEAN:
        return ICoreShapeKinds.BooleanKind;
      case JsonLike.NULL:
        return ICoreShapeKinds.NullableKind;
      case JsonLike.NUMBER:
        return ICoreShapeKinds.NumberKind;
      case JsonLike.UNDEFINED:
        return ICoreShapeKinds.OptionalKind;
      case JsonLike.ARRAY:
        return ICoreShapeKinds.ListKind;
    }
  }

  return jsonLikes.map((i) => {
    return { id: i.id, coreShapeKind: toCoreShapeKind(i.jsonType) };
  });
}
