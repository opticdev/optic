import { JsonSchemaKnownKeyword, ErrorObject } from '../traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* additionalProperties(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.additionalProperties)
    return;
  const key = validationError.params.additionalProperty;

  const propertyExamplePath = jsonPointerHelpers.append(
    validationError.instancePath,
    key
  );

  const parentObjectPath = validationError.schemaPath.substring(1);
  const propertyPath = jsonPointerHelpers.append(parentObjectPath, key);

  yield {
    kind: ShapeDiffResultKind.AdditionalProperty,
    keyword: JsonSchemaKnownKeyword.additionalProperties,
    example,

    propertyPath,
    instancePath: jsonPointerHelpers.append(validationError.instancePath, key),
    parentObjectPath,
    propertyExamplePath,
    key,
  };
}
