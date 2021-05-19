import {
  IListItemTrail,
  IListTrail,
  INullableTrail,
  IObjectFieldTrail,
  IObjectTrail,
  IOneOfItemTrail,
  IOptionalTrail,
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

      const choices = await getChoices(fieldTrail.fieldShapeId, spectacle);

      const lastObjectOption = Object.entries(
        choices.allowedCoreShapeKindsByShapeId
      ).find(([key, value]) => value === ICoreShapeKinds.ObjectKind);
      return {
        lastObject: lastObjectOption
          ? lastObjectOption[0]
          : fieldTrail.parentObjectShapeId,
        lastField: fieldTrail.fieldId,
        lastFieldShapeId: fieldTrail.fieldShapeId,
        lastFieldKey: 'AIDANFIXME',
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
    if (lastTrail.hasOwnProperty('NullableTrail')) {
      const shapeId = (lastTrail as INullableTrail).NullableTrail.shapeId;
      const choices = await getChoices(shapeId, spectacle);
      const lastItems = await shapeTrailParserLastId(
        {
          ...shapeTrail,
          path: [...shapeTrail.path.slice(0, shapeTrail.path.length - 1)],
        },
        spectacle
      );
      return {
        lastObject: lastItems.lastObject,
        lastField: lastItems.lastField,
        lastFieldKey: lastItems.lastFieldKey,
        lastFieldShapeId: lastItems.lastFieldShapeId,
        ...choices,
      };
    }
    if (lastTrail.hasOwnProperty('OptionalTrail')) {
      const shapeId = (lastTrail as IOptionalTrail).OptionalTrail.shapeId;
      const choices = await getChoices(shapeId, spectacle);
      const lastItems = await shapeTrailParserLastId(
        {
          ...shapeTrail,
          path: [...shapeTrail.path.slice(0, shapeTrail.path.length - 1)],
        },
        spectacle
      );
      return {
        lastObject: lastItems.lastObject,
        lastField: lastItems.lastField,
        lastFieldKey: lastItems.lastFieldKey,
        lastFieldShapeId: lastItems.lastFieldShapeId,
        ...choices,
      };
    }

    invariant(false, 'shape trail could not be parsed');
  } else {
    const choices = await getChoices(shapeTrail.rootShapeId, spectacle);
    const lastObject = Object.entries(
      choices.allowedCoreShapeKindsByShapeId
    ).find(([id, kind]) => {
      return kind === ICoreShapeKinds.ObjectKind;
    })?.[0];

    return {
      ...choices,
      lastObject,
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
    }[] = JsonLikeToCoreShapeKinds(result.data.shapeChoices, shapeId);

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

export function JsonLikeToCoreShapeKinds(
  jsonLikes: { id: string; jsonType: JsonLike }[],
  rootShapeId: string
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
    return {
      id: i.id || rootShapeId,
      coreShapeKind: toCoreShapeKind(i.jsonType),
    };
  });
}
