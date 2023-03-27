import { ParseOpenAPIResult } from '../parser/openapi-sourcemap-parser';
import {
  FlatOpenAPIV3,
  OpenAPIV3,
  sourcemapReader,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { JsonSchemaSourcemap } from '../parser/sourcemap';

function getFilePathFromPointer(sourcemap: JsonSchemaSourcemap, path: string) {
  const maybePath = sourcemapReader(sourcemap).findFile(path);

  return maybePath?.filePath ?? null;
}

function logPointer(
  sourcemap: JsonSchemaSourcemap,
  pointers: { old: string; new: string }
) {
  const maybeFilePath = getFilePathFromPointer(sourcemap, pointers.old);

  if (maybeFilePath) {
    sourcemap.logPointerInFile(maybeFilePath, pointers.new, pointers.old);
  }
}

// TODO this does not handle allOf: [{type:'object'...}, {allOf: [type:'object']}]
function mergeAllOf(
  allOf: FlatOpenAPIV3.SchemaObject[],
  sourcemap: JsonSchemaSourcemap,
  pointers: { old: string; new: string }
) {
  // Then we should merge this and replace it with an object
  const effectiveObject: FlatOpenAPIV3.NonArraySchemaObject = {
    type: 'object',
    properties: {},
    required: [],
  };
  for (const [index, polymorphicItem] of allOf.entries()) {
    const effectiveProperties = effectiveObject.properties!;
    for (const [key, property] of Object.entries(
      polymorphicItem.properties ?? {}
    )) {
      // For duplicates, choose the first instance of this key
      if (!effectiveProperties[key]) {
        const beforeRequiredIdx =
          polymorphicItem.required?.findIndex((s) => s === key) ?? -1;
        if (beforeRequiredIdx !== -1) {
          const oldRequired = jsonPointerHelpers.append(
            pointers.old,
            'allOf',
            String(index),
            'required',
            String(beforeRequiredIdx)
          );
          const newRequired = jsonPointerHelpers.append(
            pointers.new,
            'required',
            String(effectiveObject.required!.length)
          );
          logPointer(sourcemap, { old: oldRequired, new: newRequired });
          effectiveObject.required!.push(key);
        }
        const oldProperty = jsonPointerHelpers.append(
          pointers.old,
          'allOf',
          String(index),
          'properties',
          key
        );
        const newProperty = jsonPointerHelpers.append(
          pointers.new,
          'properties',
          key
        );
        denormalizeProperty(property, sourcemap, {
          old: oldProperty,
          new: newProperty,
        });

        logPointer(sourcemap, { old: oldProperty, new: newProperty });
        effectiveProperties[key] = property;
      }
    }
  }
  return effectiveObject;
}

function denormalizeProperty(
  schema: FlatOpenAPIV3.SchemaObject,
  sourcemap: JsonSchemaSourcemap,
  pointers: {
    old: string;
    new: string;
  }
) {
  const polymorphicKey = schema.allOf
    ? 'allOf'
    : schema.anyOf
    ? 'anyOf'
    : schema.oneOf
    ? 'oneOf'
    : null;
  const polymorphicValue = schema.allOf || schema.anyOf || schema.oneOf;
  if (polymorphicKey && polymorphicValue) {
    if (
      polymorphicKey === 'allOf' &&
      polymorphicValue.every((schema) => schema.type === 'object')
    ) {
      const effectiveObject = mergeAllOf(polymorphicValue, sourcemap, pointers);
      schema.type = effectiveObject.type;
      schema.properties = effectiveObject.properties;
      schema.required = effectiveObject.required;
      delete schema[polymorphicKey];
    } else {
      for (const [index, polymorphicItem] of polymorphicValue.entries()) {
        denormalizeProperty(polymorphicItem, sourcemap, {
          old: jsonPointerHelpers.append(
            pointers.old,
            polymorphicKey,
            String(index)
          ),
          new: jsonPointerHelpers.append(
            pointers.new,
            polymorphicKey,
            String(index)
          ),
        });
      }
    }
  } else if (schema.type === 'array' && schema.items) {
    denormalizeProperty(schema.items, sourcemap, {
      old: jsonPointerHelpers.append(pointers.old, 'items'),
      new: jsonPointerHelpers.append(pointers.new, 'items'),
    });
  } else if (schema.type === 'object') {
    const properties = schema.properties ?? {};
    for (const [key, property] of Object.entries(properties)) {
      denormalizeProperty(property, sourcemap, {
        old: jsonPointerHelpers.append(pointers.old, 'properties', key),
        new: jsonPointerHelpers.append(pointers.new, 'properties', key),
      });
    }
  }
  // else we stop here
}

// Denormalizes a dereferenced openapi spec - mutates in place
// For now, this function only denormalizes shared path parameters and flattens allOf
export function denormalize<T extends ParseOpenAPIResult>(parse: T): T {
  for (const [pathKey, path] of Object.entries(parse.jsonLike.paths)) {
    if (path && path.parameters) {
      for (const method of Object.values(OpenAPIV3.HttpMethods)) {
        const operation = path[method];
        if (operation) {
          // Merge in parameters
          for (const [idx, parameter] of path.parameters.entries()) {
            if ('$ref' in parameter) {
              continue;
            }
            // Look for an existing parameter, if it exists, we should keep the more specific parameter
            const hasParameter = operation.parameters?.find(
              (p) =>
                !('$ref' in p) &&
                p.in === parameter.in &&
                p.name === parameter.name
            );
            if (!hasParameter) {
              if (!operation.parameters) {
                operation.parameters = [];
              }

              const oldPointer = jsonPointerHelpers.compile([
                'paths',
                pathKey,
                'parameters',
                String(idx),
              ]);
              const newPointer = jsonPointerHelpers.compile([
                'paths',
                pathKey,
                method,
                'parameters',
                String(operation.parameters.length),
              ]);

              logPointer(parse.sourcemap, { old: oldPointer, new: newPointer });

              operation.parameters.push(parameter);
            }
          }
        }
      }

      // Finally, we remove the parameter on the path level
      delete path.parameters;
    }
  }

  // For all schemas, flatten allOfs
  for (const [pathKey, path] of Object.entries(parse.jsonLike.paths)) {
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      const operation = path?.[method] as
        | FlatOpenAPIV3.OperationObject
        | undefined;
      if (operation) {
        if (operation.requestBody) {
          for (const [contentType, body] of Object.entries(
            operation.requestBody.content ?? {}
          )) {
            const pointer = jsonPointerHelpers.compile([
              'paths',
              pathKey,
              method,
              'requestBody',
              'content',
              contentType,
              'schema',
            ]);
            if (body.schema) {
              denormalizeProperty(body.schema, parse.sourcemap, {
                old: pointer,
                new: pointer,
              });
            }
          }
        }
        for (const [statusCode, response] of Object.entries(
          operation.responses
        )) {
          for (const [contentType, body] of Object.entries(
            response.content ?? {}
          )) {
            const pointer = jsonPointerHelpers.compile([
              'paths',
              pathKey,
              method,
              'responses',
              statusCode,
              'content',
              contentType,
              'schema',
            ]);
            if (body.schema) {
              denormalizeProperty(body.schema, parse.sourcemap, {
                old: pointer,
                new: pointer,
              });
            }
          }
        }
      }
    }
  }

  return parse;
}
