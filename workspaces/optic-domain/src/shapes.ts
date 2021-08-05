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
export enum JsonType {
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

// Matches optic-engine/src/projections/spectacle/shapes
export type ShapeChoice =
  | {
      shapeId: string;
      jsonType: JsonType.OBJECT;
      fields: FieldShape[];
    }
  | {
      shapeId: string;
      jsonType: JsonType.ARRAY;
      itemShapeId: string;
    }
  | {
      shapeId: string;
      jsonType: Exclude<JsonType, JsonType.OBJECT | JsonType.ARRAY>;
    };
