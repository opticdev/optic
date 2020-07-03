import React, { useContext } from 'react';

import { GenericContextFactory } from './GenericContextFactory';
import {
  createEndpointDescriptor,
  getEndpointId,
} from '../utilities/EndpointUtilities';
import { RfcContext, withRfcContext } from './RfcContext';
import { commandsForUpdatingContribution } from '../engine/routines';
import {
  asPathTrail,
  getNameWithFormattedParameters,
} from '../components/utilities/PathUtilities';

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
    const { cachedQueryResults, queries, handleCommands } = this.props;
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
          handleCommands(...commandsForUpdatingContribution(id, key, value));
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

export { EndpointsContextStore, EndpointsContext, withEndpointsContext };

export function PathNameFromId({ pathId }) {
  const { cachedQueryResults } = useContext(RfcContext);

  const { pathsById } = cachedQueryResults;

  if (!pathId) {
    return null;
  }

  let pathParameters = [];

  //try to resolve this path
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

  const fullPath = pathTrailWithNames
    .map(({ pathComponentName }) => pathComponentName)
    .join('/');

  return <>{fullPath}</>;
}
