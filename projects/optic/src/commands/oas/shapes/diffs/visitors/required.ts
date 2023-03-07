import { ErrorObject, JsonSchemaKnownKeyword } from '../traverser';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';

export function* requiredKeyword(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.required) return;
  const parentObjectPath = jsonPointerHelpers.pop(
    validationError.schemaPath.substring(1)
  );
  const key = validationError.params.missingProperty;
  yield {
    description: `required property '${validationError.params.missingProperty}' was missing`,
    instancePath: jsonPointerHelpers.append(
      validationError.instancePath,
      validationError.params.missingProperty
    ),
    propertyPath: jsonPointerHelpers.append(
      parentObjectPath,
      'properties',
      key
    ),
    kind: ShapeDiffResultKind.MissingRequiredProperty,
    keyword: JsonSchemaKnownKeyword.required,
    parentObjectPath,
    key,
    example: undefined,
  };
}
