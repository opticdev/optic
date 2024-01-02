import { SchemaObject } from '../schema';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
  UnpatchableDiff,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { CapturedInteraction } from '../../../../sources/captured-interactions';
import { OAS3 } from '@useoptic/openapi-utilities';

export function* unevaluatedPropertiesDiffs(
  validationError: ErrorObject,
  example: any,
  {
    specJsonPath,
    interaction,
    schema,
  }: {
    specJsonPath: string;
    interaction: CapturedInteraction;
    schema: SchemaObject;
  }
): IterableIterator<ShapeDiffResult | UnpatchableDiff> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.unevaluatedProperties)
    return;
  const key = validationError.params.unevaluatedProperty;
  const instancePath = jsonPointerHelpers.append(
    validationError.instancePath,
    key
  );
  const propertyExamplePath = jsonPointerHelpers.append(
    validationError.instancePath,
    key
  );

  const parts = jsonPointerHelpers.decode(
    validationError.schemaPath.substring(1)
  );
  parts.pop();
  const baseSchemaPath = jsonPointerHelpers.compile(parts);
  const baseSchema = jsonPointerHelpers.tryGet(schema, baseSchemaPath);
  let pathToAllofVariant: string | null = null;
  if (baseSchema.match && baseSchema.value.allOf) {
    const allOfVariants = baseSchema.value.allOf;
    // TODO in the future we can use a more complicated heuristic to choose which allOf variant is most relevant
    const allOfIdx = allOfVariants.findIndex((schema) =>
      OAS3.isObjectType(schema.type)
    );
    if (allOfIdx > -1) {
      pathToAllofVariant = jsonPointerHelpers.compile([
        'allOf',
        String(allOfIdx),
        'properties',
      ]);
    }
  }

  if (!pathToAllofVariant) {
    // This could happen if the allOf variant has a primitive type - in this case we surface that this is unpatchable and let the user resolve this
    // Or if a user sets unevalutedProperties to their schema, we don't know how to handle if unless there's an allOf
    const schemaPath = validationError.schemaPath.substring(1);
    yield {
      validationError,
      example: jsonPointerHelpers.get(example, validationError.instancePath),
      unpatchable: true,
      interaction,
      bodyPath: specJsonPath,
      schemaPath,
      path: jsonPointerHelpers.append(
        specJsonPath,
        'schema',
        ...jsonPointerHelpers.decode(schemaPath)
      ),
    };
    return;
  }

  const parentObjectPath = jsonPointerHelpers.join(
    baseSchemaPath,
    pathToAllofVariant
  );
  const propertyPath = jsonPointerHelpers.append(parentObjectPath, key);

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
