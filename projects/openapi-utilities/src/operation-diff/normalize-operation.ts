import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Coordinates } from './coordinates';
import JsonPointerHelpers from '@useoptic/json-pointer-helpers/build/json-pointers/json-pointer-helpers';

export function normalizeOperation(
  spec: OpenAPIV3.Document,
  method: OpenAPIV3.HttpMethods,
  path: string
): OpenAPIOperation {
  const coordinateAliases: {
    [key: string]: string;
  } = {};

  const operationCoordinate = jsonPointerHelpers.compile([
    'paths',
    path,
    method,
  ]);

  let operation = jsonPointerHelpers.get(spec, operationCoordinate);

  // in-source security
  if (spec.security && !operation.security) {
    operation = { ...operation, security: spec.security };
    coordinateAliases[
      JsonPointerHelpers.append(operationCoordinate, 'security')
    ] = JsonPointerHelpers.compile(['security']);
  }

  if (spec.paths[path]!.parameters) {
    const sharedParams = spec.paths[path]!.parameters || [];
    const operationParamsCount = (operation.parameters || []).length;
    operation = {
      ...operation,
      parameters: [...(operation.parameters || []), ...sharedParams],
    };
    sharedParams.forEach((sharedParameter, index) => {
      coordinateAliases[
        JsonPointerHelpers.append(
          operationCoordinate,
          'parameters',
          (operationParamsCount + index).toString()
        )
      ] = jsonPointerHelpers.compile([
        'paths',
        path,
        'parameters',
        index.toString(),
      ]);
    });
  }

  return {
    method,
    path,
    context: {
      environments: spec.servers || [],
      securitySchemas: spec?.components?.securitySchemes as any, // need to fork openapi-type and get rid of $ref
      sharedParameters: spec.paths[path]!.parameters || ([] as any), // need to fork openapi-type and get rid of $ref,
    },
    operation,
    coordinates: {
      absoluteJsonPath: jsonPointerHelpers.compile(['paths', path, method]),
    },
    coordinateAliases,
  };
}

export interface OpenAPIOperation {
  method: string;
  path: string;
  context: {
    environments: OpenAPIV3.ServerObject[];
    securitySchemas: {
      [key: string]: OpenAPIV3.SecuritySchemeObject;
    };
    sharedParameters: OpenAPIV3.ParameterObject[];
  };
  operation: OpenAPIV3.OperationObject;
  coordinates: Coordinates;
  // for post-processing rule results
  coordinateAliases: {
    [key: string]: string;
  };
}
