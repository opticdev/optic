export type IShapeTrailComponent =
  | IObjectTrail
  | IOneOfItemTrail
  | IObjectFieldTrail
  | IListTrail
  | IListItemTrail
  | INullableTrail
  | IOptionalTrail
  | IOptionalItemTrail
  | INullableItemTrail
  | IUnknownTrail;

//todo one time export from scala js, switch to types from Rust

export interface IShapeTrail {
  rootShapeId: string;
  path: IShapeTrailComponent[];
}

// Individual Trails
export interface IObjectTrail {
  ObjectTrail: {
    shapeId: string;
  };
}

export interface IOneOfItemTrail {
  OneOfItemTrail: {
    oneOfId: string;
    parameterId: string;
    itemShapeId: string;
  };
}

export interface IObjectFieldTrail {
  ObjectFieldTrail: {
    fieldId: string;
    fieldShapeId: string;
    parentObjectShapeId: string;
  };
}

export interface IListTrail {
  ListTrail: {
    shapeId: string;
  };
}

export interface IListItemTrail {
  ListItemTrail: {
    listShapeId: string;
    itemShapeId: string;
  };
}

export interface INullableTrail {
  NullableTrail: {
    shapeId: string;
  };
}

export interface IOptionalItemTrail {
  OptionalItemTrail: {
    shapeId: string;
    innerShapeId: string;
  };
}

export interface INullableItemTrail {
  NullableItemTrail: {
    shapeId: string;
    innerShapeId: string;
  };
}

export interface IUnknownTrail {
  UnknownTrail: {};
}

export interface IOneOfTrail {
  OneOfTrail: {
    shapeId: string;
  };
}

export interface IOptionalTrail {
  OptionalTrail: {
    shapeId: string;
  };
}

// used for grouping during interpretation
export function normalizeShapeTrail(trail: IShapeTrail): IShapeTrail {
  const withIndex: [
    IShapeTrailComponent,
    number
  ][] = trail.path.map((item, index) => [item, index]);

  const listItemIndexes: number[] = withIndex
    .filter(([item, index]) => Boolean((item as IListItemTrail).ListItemTrail))
    .map(([item, index]) => index);

  const fieldIndexes = withIndex
    .filter(([item, index]) =>
      Boolean((item as IObjectFieldTrail).ObjectFieldTrail)
    )
    .map(([item, index]) => index);

  const lastIndex = Math.max(...[...listItemIndexes, ...fieldIndexes]);

  const newTrail =
    lastIndex > 0 ? trail.path.slice(0, lastIndex + 1) : trail.path;

  return {
    rootShapeId: trail.rootShapeId,
    path: newTrail,
  };
}
