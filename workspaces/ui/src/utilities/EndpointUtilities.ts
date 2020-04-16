import {
  asPathTrail,
  getNameWithFormattedParameters,
  isPathParameter,
} from '../components/utilities/PathUtilities';

import {
  DESCRIPTION,
  pathMethodKeyBuilder,
  PURPOSE,
} from '../ContributionKeys';

import { getNormalizedBodyDescriptor } from './RequestUtilities';
import sortBy from 'lodash.sortby';

export interface EndpointDescriptor {
  httpMethod: string;
  method: string;
  pathId: string;
  fullPath: string;
  pathParameters: Array<{
    pathId: string;
    name: string;
    description: string;
  }>;
  requestBodies: Array<{
    requestId: string;
    requestBody: any; // replace with RequestBodyDescriptor
  }>;
  responses: Array<{
    responseId: string;
    responseBody: any; // replace with ResponseBodyDescriptor
    statusCode: number; // replace with HttpStatusCode enum?
  }>;
  endpointPurpose?: string;
  endpointDescription?: string;
  isEmpty: boolean;
}

export function getEndpointId({ method, pathId }) {
  return pathMethodKeyBuilder(pathId, method);
}

export function createEndpointDescriptor(
  { method, pathId }: { method: string; pathId: string },
  cachedQueryResults: {
    requests: any[];
    pathsById: { [id: string]: any };
    requestIdsByPathId: { [id: string]: any };
    responsesArray: any[];
    contributions: any;
  }
): EndpointDescriptor {
  const {
    requests,
    pathsById,
    requestIdsByPathId,
    responsesArray,
    contributions,
  } = cachedQueryResults;

  const endpointId = getEndpointId({ pathId, method });
  const requestIdsOnPath = (requestIdsByPathId[pathId] || []).map(
    (requestId) => requests[requestId]
  );
  const requestsOnPathAndMethod = requestIdsOnPath.filter(
    (request) => request.requestDescriptor.httpMethod === method.toUpperCase()
  );

  let fullPath;
  let pathParameters = [];

  //try to resolve this path
  try {
    const pathTrail = asPathTrail(pathId, pathsById);
    const pathTrailComponents = pathTrail.map((pathId) => pathsById[pathId]);

    const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
      const pathComponentName = getNameWithFormattedParameters(pathComponent);
      const pathComponentId = pathComponent.pathId;
      return {
        pathComponentName,
        pathComponentId,
      };
    });

    fullPath = pathTrailWithNames
      .map(({ pathComponentName }) => pathComponentName)
      .join('/');

    pathParameters = pathTrail
      .map((pathId) => pathsById[pathId])
      .filter((p) => isPathParameter(p))
      .map((p) => ({
        pathId: p.pathId,
        name: p.descriptor.ParameterizedPathComponentDescriptor.name,
        description: contributions.getOrUndefined(p.pathId, DESCRIPTION),
      }));
  } catch (e) {
    // TODO figure out what error we would expect for method / pathId we can't find, so
    // we can deal with that explicitly and stop swallowing other errors
    console.log(e);
  }

  if (!fullPath) return null; // can not find endpoint requests

  const requestBodies = requestsOnPathAndMethod.map(
    ({ requestId, requestDescriptor }) => {
      const requestBody = getNormalizedBodyDescriptor(
        requestDescriptor.bodyDescriptor
      );
      return {
        requestId,
        requestBody,
      };
    }
  );

  const responsesForPathAndMethod = sortBy(
    responsesArray
      .filter(
        (response) =>
          response.responseDescriptor.httpMethod === method.toUpperCase() &&
          response.responseDescriptor.pathId === pathId
      )
      .map(({ responseId, responseDescriptor }) => {
        const responseBody = getNormalizedBodyDescriptor(
          responseDescriptor.bodyDescriptor
        );
        return {
          responseId,
          responseBody,
          statusCode: responseDescriptor.httpStatusCode,
        };
      }),
    ['statusCode']
  );

  return {
    httpMethod: method,
    method,
    pathId,
    fullPath,
    pathParameters,
    requestBodies,
    responses: responsesForPathAndMethod,
    endpointPurpose: contributions.getOrUndefined(endpointId, PURPOSE),
    endpointDescription: contributions.getOrUndefined(endpointId, DESCRIPTION),
    isEmpty:
      requestBodies.length === 0 && responsesForPathAndMethod.length === 0,
  };
}
