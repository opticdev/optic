import { JsonSchemaKnownKeyword, ErrorObject } from '../traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* oneOfKeyword(
  schemaPath: string,
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  const typeKeywordPath = jsonPointerHelpers.decode(
    validationError.schemaPath.substring(1)
  );

  const oneOfIndex = jsonPointerHelpers
    .compile(typeKeywordPath)
    .lastIndexOf('oneOf');

  const propertyPath = jsonPointerHelpers.compile(
    typeKeywordPath.slice(0, oneOfIndex + 1)
  );

  const keyName = jsonPointerHelpers.decode(propertyPath).pop() || '';

  const unmatchedValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );

  yield {
    schemaPath,
    kind: ShapeDiffResultKind.UnmatchedType,
    keyword: JsonSchemaKnownKeyword.oneOf,
    instancePath: validationError.instancePath,
    propertyPath: propertyPath,
    key: keyName,
    example: unmatchedValue,
  };
}
