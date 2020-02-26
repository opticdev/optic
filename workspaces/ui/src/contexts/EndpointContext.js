import React from 'react';
import {GenericContextFactory} from './GenericContextFactory';
import {asPathTrail, getNameWithFormattedParameters, isPathParameter} from '../components/utilities/PathUtilities';
import {DESCRIPTION, pathMethodKeyBuilder, PURPOSE} from '../ContributionKeys';
import {getNormalizedBodyDescriptor} from '../utilities/RequestUtilities';
import {withRfcContext} from './RfcContext';

const {
  Context: EndpointsContext,
  withContext: withEndpointsContext
} = GenericContextFactory(null);

class EndpointsContextStoreWithoutContext extends React.Component {
  render() {

    //usage defined props
    const {pathId, method} = this.props;
    const lookupExampleForRequest = (requestId) => this.props.lookupExampleForRequest(pathId, method, requestId);
    const lookupExampleForResponse = (responseId) => this.props.lookupExampleForResponse(pathId, method, responseId);
    //props from context
    const {cachedQueryResults, queries} = this.props;
    const {requests, pathsById, requestIdsByPathId, responsesArray, contributions, requestParameters} = cachedQueryResults;

    const requestIdsOnPath = (requestIdsByPathId[pathId] || []).map(requestId => requests[requestId]);
    const requestsOnPathAndMethod = requestIdsOnPath.filter(request => request.requestDescriptor.httpMethod === method.toUpperCase());

    if (requestsOnPathAndMethod.length) {
      const {httpMethod, pathComponentId} = requestsOnPathAndMethod[0].requestDescriptor;
      const pathTrail = asPathTrail(pathComponentId, pathsById);
      const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId]);
      const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
        const pathComponentName = getNameWithFormattedParameters(pathComponent);
        const pathComponentId = pathComponent.pathId;
        return {
          pathComponentName,
          pathComponentId
        };
      });

      const fullPath = pathTrailWithNames.map(({pathComponentName}) => pathComponentName)
        .join('/');

      const pathParameters = pathTrail
        .map(pathId => pathsById[pathId])
        .filter((p) => isPathParameter(p))
        .map(p => ({
          pathId: p.pathId,
          name: p.descriptor.ParameterizedPathComponentDescriptor.name,
          description: contributions.getOrUndefined(p.pathId, DESCRIPTION)
        }));

      const requestBodies = requestsOnPathAndMethod.map(({requestId, requestDescriptor}) => {
        const requestBody = getNormalizedBodyDescriptor(requestDescriptor.bodyDescriptor);
        return {
          requestId,
          requestBody,
        };
      });


      const responsesForPathAndMethod = responsesArray
        .filter(response => response.responseDescriptor.httpMethod === method.toUpperCase() && response.responseDescriptor.pathId === pathId)
        .map(({responseId, responseDescriptor}) => {
          const responseBody = getNormalizedBodyDescriptor(responseDescriptor.bodyDescriptor);
          return {
            responseId,
            responseBody,
          };
        })

      const endpointDescriptor = {
        httpMethod,
        pathId,
        fullPath,
        pathParameters,
        requestBodies,
        responses: responsesForPathAndMethod,
        endpointPurpose: contributions.getOrUndefined(pathMethodKeyBuilder(pathId, method), PURPOSE),
        endpointDescription: contributions.getOrUndefined(pathMethodKeyBuilder(pathId, method), DESCRIPTION),

      };

      const context = {
        endpointDescriptor,
        getContributions: (id, key) => contributions.getOrUndefined(id, key),
        lookupExampleForRequest,
        lookupExampleForResponse
      };

      return (
        <EndpointsContext.Provider value={context}>
          {this.props.children}
        </EndpointsContext.Provider>
      );

    } else {
      debugger
      return <div>Endpoint Not Found</div>;
    }
  }
}

const EndpointsContextStore = withRfcContext(EndpointsContextStoreWithoutContext);

export {
  EndpointsContextStore,
  EndpointsContext,
  withEndpointsContext
};
