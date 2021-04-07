/*
Replace with Rust constructors eventually

AddShape,
SetParameterShape,
ProviderInShape,
ShapeProvider,
SetFieldShape,
FieldShapeFromShape,
RemoveField,
 */

export function AddShape(
  shapeId: string,
  baseShapeId: string,
  name: string = ''
) {
  return { AddShape: { shapeId, baseShapeId, name } };
}

//helper
type FieldFromShapeType = {
  FieldShapeFromShape: { fieldId: string; shapeId: string };
};

export function FieldShapeFromShape(
  fieldId: string,
  shapeId: string
): FieldFromShapeType {
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
