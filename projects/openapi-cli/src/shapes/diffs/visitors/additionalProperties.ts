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

  const parentObjectPath = (() => {
    const parentObjectPath = jsonPointerHelpers.decode(
      validationError.schemaPath.substring(1)
    );

    if (
      parentObjectPath[parentObjectPath.length - 1] === 'additionalProperties'
    ) {
      parentObjectPath.pop();
      return jsonPointerHelpers.compile([...parentObjectPath, 'properties']);
    }
    return jsonPointerHelpers.compile(parentObjectPath);
  })();

  const propertyPath = jsonPointerHelpers.append(parentObjectPath, key);
  const instancePath = jsonPointerHelpers.append(
    validationError.instancePath,
    key
  );

  yield {
    description: `'${key}' is not documented`,
    kind: ShapeDiffResultKind.AdditionalProperty,
    keyword: JsonSchemaKnownKeyword.additionalProperties,
    example: jsonPointerHelpers.get(example, instancePath),

    propertyPath,
    instancePath,
    parentObjectPath,
    propertyExamplePath,
    key,
  };
}
