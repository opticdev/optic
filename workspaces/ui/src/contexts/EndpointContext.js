import React from 'react';
import { GenericContextFactory } from './GenericContextFactory';
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
import { getNormalizedBodyDescriptor } from '../utilities/RequestUtilities';
import { withRfcContext } from './RfcContext';
import sortBy from 'lodash.sortby';
import { EndpointPage } from '../components/requests/EndpointPage';
import { updateContribution as commandsForUpdatingContribution } from '../engine/routines';
const {
  Context: EndpointsContext,
  withContext: withEndpointsContext,
} = GenericContextFactory(null);

class EndpointsContextStoreWithoutContext extends React.Component {
  render() {
    //usage defined props
    const { pathId, method, notFound } = this.props;
    const lookupExampleForRequest = (requestId) =>
      this.props.lookupExampleForRequest(pathId, method, requestId);
    const lookupExampleForResponse = (responseId) =>
      this.props.lookupExampleForResponse(pathId, method, responseId);
    //props from context
    const { cachedQueryResults, queries, handleCommand } = this.props;
    const { contributions } = cachedQueryResults;

    const endpointId = getEndpointId({ pathId, method });
    const endpointDescriptor = createEndpointDescriptor(
      { pathId, method },
      cachedQueryResults
    );

    if (endpointDescriptor) {
      const context = {
        endpointId,
        endpointDescriptor,
        getContribution: (id, key) => contributions.getOrUndefined(id, key),
        lookupExampleForRequest,
        lookupExampleForResponse,
        updateContribution: (id, key, value) => {
          handleCommand(commandsForUpdatingContribution(id, key, value));
        },
      };

      return (
        <EndpointsContext.Provider value={context}>
          {this.props.children}
        </EndpointsContext.Provider>
      );
    } else {
      return (
        notFound || (
          <div>
            Endpoint Not Found {method} {pathId}
          </div>
        )
      );
    }
  }
}

const EndpointsContextStore = withRfcContext(
  EndpointsContextStoreWithoutContext
);

// (View) Models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot.

export function getEndpointId({ method, pathId }) {
  return pathMethodKeyBuilder(pathId, method);
}

export function createEndpointDescriptor(
  { method, pathId },
  cachedQueryResults
) {
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

export { EndpointsContextStore, EndpointsContext, withEndpointsContext };
