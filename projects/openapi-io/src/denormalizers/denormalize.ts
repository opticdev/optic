import { ParseOpenAPIResult } from '../parser/openapi-sourcemap-parser';
import {
  FlatOpenAPIV2,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
  OpenAPIV3,
  SWAGGER2_HTTP_METHODS,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { logPointer } from './pointer';
import { denormalizeProperty } from './denormalizeProperty';
import { JsonSchemaSourcemap } from '../parser/sourcemap';

// Denormalizes a dereferenced openapi spec - mutates in place
// This function
// - denormalizes shared path parameters
// - flattens allOf
// - adds response headers {} if not set
// - adds parameters [] if not set
export function denormalize<
  Version extends
    | FlatOpenAPIV2.Document
    | FlatOpenAPIV3.Document
    | FlatOpenAPIV3_1.Document,
  T extends {
    jsonLike: ParseOpenAPIResult<Version>['jsonLike'];
    sourcemap?: ParseOpenAPIResult<Version>['sourcemap'];
  },
>(parse: T, version: '2.x.x' | '3.0.x' | '3.1.x', warnings?: string[]): T {
  parse = {
    ...parse,
    jsonLike: JSON.parse(JSON.stringify(parse.jsonLike)),
  } as T;

  if (version === '2.x.x') {
    const consumes: string[] | undefined = (parse.jsonLike as any).consumes;
    const produces: string[] | undefined = (parse.jsonLike as any).produces;
    delete (parse.jsonLike as any).consumes;
    delete (parse.jsonLike as any).produces;
    for (const [pathKey, path] of Object.entries(parse.jsonLike.paths ?? {})) {
      if (path) {
        denormalizePathsV2(path, pathKey, parse.sourcemap, warnings);

        for (const method of Object.values(OpenAPIV3.HttpMethods)) {
          const operation = path?.[method] as
            | FlatOpenAPIV2.OperationObject
            | undefined;
          if (operation) {
            denormalizeOperationV2(
              operation,
              { path: pathKey, method, consumes, produces },
              parse.sourcemap,
              warnings
            );
          }
        }
      }
    }
  } else {
    for (const [pathKey, path] of Object.entries(parse.jsonLike.paths ?? {})) {
      if (path) {
        denormalizePathsV3(
          path as FlatOpenAPIV3.PathItemObject,
          pathKey,
          parse.sourcemap,
          warnings
        );

        for (const method of Object.values(OpenAPIV3.HttpMethods)) {
          const operation = path?.[method] as
            | FlatOpenAPIV3.OperationObject
            | undefined;
          if (operation) {
            denormalizeOperationV3(
              operation,
              { path: pathKey, method },
              parse.sourcemap,
              warnings
            );
          }
        }
      }
    }
  }

  return parse;
}

export function denormalizePathsV2(
  path: FlatOpenAPIV2.PathItemObject,
  pathKey: string,
  sourcemap?: JsonSchemaSourcemap,
  warnings?: string[]
) {
  if (path.parameters) {
    for (const method of SWAGGER2_HTTP_METHODS) {
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

            sourcemap &&
              logPointer(sourcemap, { old: oldPointer, new: newPointer });

            operation.parameters.push(parameter);
          }
        }
      }
    }
  }
  // Finally, we remove the parameter on the path level
  delete path.parameters;
}

export function denormalizeOperationV2(
  operation: FlatOpenAPIV2.OperationObject,
  {
    path,
    method,
    produces,
    consumes,
  }: {
    path: string;
    method: string;
    produces?: string[];
    consumes?: string[];
  },
  sourcemap?: JsonSchemaSourcemap,
  warnings?: string[]
) {
  if (consumes) {
    if (operation.consumes) {
      operation.consumes = [...new Set([...operation.consumes, ...consumes])];
    } else {
      operation.consumes = [...consumes];
    }
  }

  if (produces) {
    if (operation.produces) {
      operation.produces = [...new Set([...operation.produces, ...produces])];
    } else {
      operation.produces = [...produces];
    }
  }
}

export function denormalizePathsV3(
  path: FlatOpenAPIV3.PathItemObject,
  pathKey: string,
  sourcemap?: JsonSchemaSourcemap,
  warnings?: string[]
) {
  if (path.parameters) {
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

            sourcemap &&
              logPointer(sourcemap, { old: oldPointer, new: newPointer });

            operation.parameters.push(parameter);
          }
        }
      }
    }

    // Finally, we remove the parameter on the path level
    delete path.parameters;
  }
}

export function denormalizeOperationV3(
  operation: FlatOpenAPIV3.OperationObject,
  {
    path,
    method,
  }: {
    path: string;
    method: string;
  },
  sourcemap?: JsonSchemaSourcemap,
  warnings?: string[]
) {
  // For all schemas, flatten allOfs
  if (operation.requestBody) {
    for (const [contentType, body] of Object.entries(
      operation.requestBody.content ?? {}
    )) {
      const pointer = jsonPointerHelpers.compile([
        'paths',
        path,
        method,
        'requestBody',
        'content',
        contentType,
        'schema',
      ]);
      if (body.schema) {
        const w = denormalizeProperty(body.schema, sourcemap, {
          old: pointer,
          new: pointer,
        });
        warnings?.push(...w);
      }
    }
  }
  for (const [statusCode, response] of Object.entries(operation.responses)) {
    for (const [contentType, body] of Object.entries(response.content ?? {})) {
      const pointer = jsonPointerHelpers.compile([
        'paths',
        path,
        method,
        'responses',
        statusCode,
        'content',
        contentType,
        'schema',
      ]);
      if (body.schema) {
        const w = denormalizeProperty(body.schema, sourcemap, {
          old: pointer,
          new: pointer,
        });
        warnings?.push(...w);
      }
    }
  }

  // Attaches a `parameters` key to all methods
  if (!operation.parameters) {
    operation.parameters = [];
  }

  // Attaches a `response.headers` key to all responses
  for (const responseObj of Object.values(operation.responses)) {
    if (!responseObj.headers) {
      responseObj.headers = {};
    }
  }
}
