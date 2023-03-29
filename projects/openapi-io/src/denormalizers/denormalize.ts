import { ParseOpenAPIResult } from '../parser/openapi-sourcemap-parser';
import { FlatOpenAPIV3, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { logPointer } from './pointer';
import { denormalizeProperty } from './denormalizeProperty';

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
