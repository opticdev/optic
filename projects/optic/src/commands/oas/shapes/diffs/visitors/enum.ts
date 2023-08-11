import { JsonSchemaKnownKeyword, ErrorObject } from '../traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* enumKeyword(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.enum) return;
  const propertyPath = validationError.schemaPath.substring(1);
  const parts = jsonPointerHelpers.decode(propertyPath);
  const key = parts[parts.length - 2];
  const unmatchedEnumValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );
  yield {
    description: `'${key}' does not have enum value ${unmatchedEnumValue}`,
    kind: ShapeDiffResultKind.MissingEnumValue,
    keyword: JsonSchemaKnownKeyword.enum,
    value: unmatchedEnumValue,
    example,
    propertyPath,
    instancePath: validationError.instancePath,
    key,
  };
}
