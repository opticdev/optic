import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* diffRequiredKeyword(
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
