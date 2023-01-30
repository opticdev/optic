import { ParseOpenAPIResult } from '../parser/openapi-sourcemap-parser';
import {
  OpenAPIV3,
  SerializedSourcemap,
  sourcemapReader,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

function getFilePathFromPointer(sourcemap: SerializedSourcemap, path: string) {
  const maybePath = sourcemapReader(sourcemap).findFile(path);

  return maybePath?.filePath ?? null;
}

// Denormalizes a dereferenced openapi spec
// For now, this function only denormalizes shared path parameters
export function denormalize(parse: ParseOpenAPIResult): ParseOpenAPIResult {
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

              const maybeFilePath = getFilePathFromPointer(
                parse.sourcemap,
                oldPointer
              );

              if (maybeFilePath) {
                parse.sourcemap.logPointerInFile(
                  maybeFilePath,
                  newPointer,
                  oldPointer
                );
              }
              operation.parameters.push(parameter);
            }
          }
        }
      }

      // Finally, we remove the parameter on the path level
      delete path.parameters;
    }
  }

  return parse;
}
