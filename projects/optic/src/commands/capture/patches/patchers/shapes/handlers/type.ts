import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';

export function* diffTypeKeyword(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.type) return;
  const typeKeywordPath = jsonPointerHelpers.decode(
    validationError.schemaPath.substring(1)
  );

  const propertyPath = jsonPointerHelpers.pop(
    jsonPointerHelpers.compile(typeKeywordPath)
  );

  const keyName = jsonPointerHelpers.decode(propertyPath).pop() || '';

  const unmatchedValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );

  yield {
    description: `'${keyName}' did not match schema`,
    expectedType: `${validationError.params.type}`,
    kind: ShapeDiffResultKind.UnmatchedType,
    keyword: JsonSchemaKnownKeyword.type,
    instancePath: validationError.instancePath,
    propertyPath: propertyPath,
    key: keyName,
    example: unmatchedValue,
  };
}
