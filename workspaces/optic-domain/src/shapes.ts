// Shape events
export enum ICoreShapeKinds {
  ObjectKind = '$object',
  ListKind = '$list',
  MapKind = '$map',
  OneOfKind = '$oneOf',
  AnyKind = '$any',
  StringKind = '$string',
  NumberKind = '$number',
  BooleanKind = '$boolean',
  NullableKind = '$nullable',
  OptionalKind = '$optional',
  UnknownKind = '$unknown',
}

export enum ICoreShapeInnerParameterNames {
  ListInner = '$listItem',
  NullableInner = '$nullableInner',
  OptionalInner = '$optionalInner',
}

// Optic engine shape types
export enum JsonLike {
  OBJECT = 'Object',
  ARRAY = 'Array',
  NULL = 'Null',
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  UNDEFINED = 'Undefined',
}

// Matches optic-engine/src/projections/spectacle/shapes
export type FieldShape = {
  name: string;
  fieldId: string;
  shapeId: string;
};

export type ShapeChoice =
  | {
      shapeId: string;
      jsonType: JsonLike.OBJECT;
      fields: FieldShape[];
    }
  | {
      shapeId: string;
      jsonType: JsonLike.ARRAY;
      itemShapeId: string;
    }
  | {
      shapeId: string;
      jsonType: Exclude<JsonLike, JsonLike.OBJECT | JsonLike.ARRAY>;
    };
