import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { Schema, SchemaObject } from '../schema';
import { ShapeLocation } from '../documented-bodies';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ShapePatch } from '../patches';
import { OperationGroup, PatchImpact } from '../../../../../oas/specs/patches';

export function* additionalPropertiesDiffs(
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

export function* additionalPropertiesPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  if (diff.kind !== ShapeDiffResultKind.AdditionalProperty) return;

  const parentPath = jsonPointerHelpers.pop(diff.parentObjectPath);

  const parentOption = jsonPointerHelpers.tryGet(schema, parentPath);

  if (!parentOption.match) return;

  const parent = parentOption.value;

  const propertiesPath = jsonPointerHelpers.append(parentPath, 'properties');
  const requiredPath = jsonPointerHelpers.append(parentPath, 'required');
  const newPropertyPath = jsonPointerHelpers.append(
    parentPath,
    'properties',
    diff.key
  );

  // if properties is not set, create one with empty {}
  let groupedOperations: OperationGroup[] = [];
  if (!parent.properties) {
    groupedOperations.push(
      OperationGroup.create(`add properties {} to parent object`, {
        op: 'add',
        path: propertiesPath,
        value: {},
      })
    );
  }
  // if required is not set, create one with property in it
  if (!parent.required) {
    groupedOperations.push(
      OperationGroup.create(
        `add required [] to parent object and make ${diff.key} required`,
        {
          op: 'add',
          path: requiredPath,
          value: [diff.key],
          // @ts-ignore
          extra: 'same',
        }
      )
    );
  } else if (!parent.required.includes(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(`make new property ${diff.key} required`, {
        op: 'add',
        path: requiredPath + '/-', // append
        value: diff.key,
      })
    );
  }

  // ok now we're ready for the property
  if (!(parent.properties || {}).hasOwnProperty(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(
        `add property ${diff.key} schema to properties`,

        {
          op: 'add',
          path: newPropertyPath,
          value: Schema.baseFromValue(diff.example, openAPIVersion),
        }
      )
    );
  }

  if (groupedOperations.length < 1) return;

  yield {
    description: `add property ${diff.key}`,
    diff,
    impact: [
      PatchImpact.Addition,
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inResponse' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations,
    shouldRegeneratePatches: false,
  };
}
