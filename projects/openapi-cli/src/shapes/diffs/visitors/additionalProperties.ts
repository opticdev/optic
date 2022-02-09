import { JsonSchemaKnownKeyword, ErrorObject } from '../traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* additionalProperties(
  schemaPath: string,
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
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

    schemaPath,
    propertyPath,
    instancePath: jsonPointerHelpers.append(validationError.instancePath, key),
    parentObjectPath,
    propertyExamplePath,
    key,
  };
}
