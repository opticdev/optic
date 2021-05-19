/*
TODO Replace with Rust constructors eventually
*/

// TODO fix any types in this file
export type CQRSCommand =
  | AddShapeType
  | AddRequestType
  | FieldFromShapeType
  | AddFieldType
  | ShapeProviderType
  | ProviderInShapeType
  | SetParameterShapeType
  | SetFieldShapeType
  | AddShapeParameterType
  | RemoveFieldType
  | AddPathParameterType
  | AddPathComponentType
  | AddContributionType
  | ShapedBodyDescriptorType
  | SetResponseBodyShapeType
  | SetRequestBodyShapeType;

export type AddShapeType = ReturnType<typeof AddShape>;
export type AddRequestType = ReturnType<typeof AddRequest>;
export type FieldFromShapeType = ReturnType<typeof FieldShapeFromShape>;
export type AddFieldType = ReturnType<typeof AddField>;
export type ShapeProviderType = ReturnType<typeof ShapeProvider>;
export type ProviderInShapeType = ReturnType<typeof ProviderInShape>;
export type SetParameterShapeType = ReturnType<typeof SetParameterShape>;
export type SetFieldShapeType = ReturnType<typeof SetFieldShape>;
export type AddShapeParameterType = ReturnType<typeof AddShapeParameter>;
export type RemoveFieldType = ReturnType<typeof RemoveField>;
export type AddPathParameterType = ReturnType<typeof AddPathParameter>;
export type AddPathComponentType = ReturnType<typeof AddPathComponent>;
export type AddContributionType = ReturnType<typeof AddContribution>;
export type ShapedBodyDescriptorType = ReturnType<typeof ShapedBodyDescriptor>;
export type SetResponseBodyShapeType = ReturnType<typeof SetResponseBodyShape>;
export type SetRequestBodyShapeType = ReturnType<typeof SetRequestBodyShape>;

export function AddShape(
  shapeId: string,
  baseShapeId: string,
  name: string = ''
) {
  return { AddShape: { shapeId, baseShapeId, name } };
}

export function AddRequest(
  httpMethod: string,
  pathId: string,
  requestId: string
) {
  return { AddRequest: { httpMethod, pathId, requestId } };
}

export function FieldShapeFromShape(fieldId: string, shapeId: string) {
  return { FieldShapeFromShape: { fieldId, shapeId } };
}

export function AddField(
  fieldId: string,
  shapeId: string,
  name: string,
  shapeDescriptor: FieldFromShapeType
) {
  return { AddField: { fieldId, shapeId, name, shapeDescriptor } };
}

export function ShapeProvider(shapeId: string) {
  return { ShapeProvider: { shapeId } };
}

export function ProviderInShape(
  shapeId: string,
  providerDescriptor: any,
  consumingParameterId: string
) {
  return {
    ProviderInShape: { shapeId, providerDescriptor, consumingParameterId },
  };
}

export function SetParameterShape(shapeDescriptor: any) {
  return { SetParameterShape: { shapeDescriptor } };
}
export function SetFieldShape(shapeDescriptor: FieldFromShapeType) {
  return { SetFieldShape: { shapeDescriptor } };
}

export function AddShapeParameter(
  shapeParameterId: string,
  shapeId: string,
  name: string
) {
  return { AddShapeParameter: { shapeParameterId, shapeId, name } };
}

export function RemoveField(fieldId: string) {
  return { RemoveField: { fieldId } };
}

export function AddPathParameter(
  pathId: string,
  parentPathId: string,
  name: string
) {
  return {
    AddPathParameter: {
      pathId,
      parentPathId,
      name,
    },
  };
}

export function AddPathComponent(
  pathId: string,
  parentPathId: string,
  name: string
) {
  return {
    AddPathComponent: {
      pathId,
      parentPathId,
      name,
    },
  };
}

export function AddContribution(id: string, key: string, value: string) {
  return {
    AddContribution: {
      id,
      key,
      value,
    },
  };
}

export function ShapedBodyDescriptor(
  httpContentType: string,
  shapeId: string,
  isRemoved: boolean = false
) {
  return {
    httpContentType,
    shapeId,
    isRemoved,
  };
}
export function SetResponseBodyShape(responseId: string, bodyDescriptor: any) {
  return {
    SetResponseBodyShape: {
      responseId,
      bodyDescriptor,
    },
  };
}
export function SetRequestBodyShape(requestId: string, bodyDescriptor: any) {
  return {
    SetRequestBodyShape: {
      requestId,
      bodyDescriptor,
    },
  };
}
