import { JsonSchemaKnownKeyword, ErrorObject } from '../traverser';
import { ShapeDiffResult, ShapeDiffResultKind } from '../result';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* oneOfKeyword(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.oneOf) return;
  if (
    validationError.params.passingSchemas &&
    validationError.params.passingSchemas.length > 0
  )
    return; // no diffs or patches for multiple matches yet
  const typeKeywordPath = jsonPointerHelpers.decode(
    validationError.schemaPath.substring(1)
  );

  const oneOfIndex = typeKeywordPath.lastIndexOf('oneOf');

  const propertyPath = jsonPointerHelpers.compile(
    typeKeywordPath.slice(0, oneOfIndex + 1)
  );
  const keyName = jsonPointerHelpers.decode(propertyPath).pop() || '';

  const unmatchedValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );

  yield {
    description: `'${keyName}' did not match schema`,
    kind: ShapeDiffResultKind.UnmatchedType,
    keyword: JsonSchemaKnownKeyword.oneOf,
    instancePath: validationError.instancePath,
    propertyPath: propertyPath,
    key: keyName,
    example: unmatchedValue,
  };
}
