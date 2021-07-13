/*
TODO Replace with Rust constructors eventually
*/

// TODO fix any types in this file
export type CQRSCommand =
  | AddShapeType
  | AddQueryParametersType
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
  | SetQueryParameteresShapeType
  | SetResponseBodyShapeType
  | SetRequestBodyShapeType
  | AddResponseByPathAndMethodType
  | PrunePathComponentsType
  | QueryParametersShapeDescriptor;

export type AddShapeType = ReturnType<typeof AddShape>;
export type AddQueryParametersType = ReturnType<typeof AddQueryParameters>;
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
export type SetQueryParameteresShapeType = ReturnType<
  typeof SetQueryParametersShape
>;
export type QueryParametersShapeDescriptor = ReturnType<
  typeof QueryParametersShapeDescriptor
>;
export type SetResponseBodyShapeType = ReturnType<typeof SetResponseBodyShape>;
export type SetRequestBodyShapeType = ReturnType<typeof SetRequestBodyShape>;
export type AddResponseByPathAndMethodType = ReturnType<
  typeof AddResponseByPathAndMethod
>;
export type PrunePathComponentsType = ReturnType<typeof PrunePathComponents>;

export function AddShape(
  shapeId: string,
  baseShapeId: string,
  name: string = ''
) {
  return { AddShape: { shapeId, baseShapeId, name } };
}

export function AddQueryParameters(
  httpMethod: string,
  pathId: string,
  queryParametersId: string
) {
  return { AddQueryParameters: { httpMethod, pathId, queryParametersId } };
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

export function QueryParametersShapeDescriptor(
  shapeId: string,
  isRemoved: boolean = false
) {
  return {
    shapeId,
    isRemoved,
  };
}

export function SetQueryParametersShape(
  queryParametersId: string,
  shapeDescriptor: ReturnType<typeof QueryParametersShapeDescriptor>
) {
  return {
    SetQueryParametersShape: {
      queryParametersId,
      shapeDescriptor,
    },
  };
}

export function SetResponseBodyShape(
  responseId: string,
  bodyDescriptor: ReturnType<typeof ShapedBodyDescriptor>
) {
  return {
    SetResponseBodyShape: {
      responseId,
      bodyDescriptor,
    },
  };
}
export function SetRequestBodyShape(
  requestId: string,
  bodyDescriptor: ReturnType<typeof ShapedBodyDescriptor>
) {
  return {
    SetRequestBodyShape: {
      requestId,
      bodyDescriptor,
    },
  };
}

export function AddResponseByPathAndMethod(
  responseId: string,
  pathId: string,
  httpMethod: string,
  httpStatusCode: number
) {
  return {
    AddResponseByPathAndMethod: {
      responseId,
      pathId,
      httpMethod,
      httpStatusCode,
    },
  };
}

export function PrunePathComponents() {
  return {
    PrunePathComponents: {},
  };
}
