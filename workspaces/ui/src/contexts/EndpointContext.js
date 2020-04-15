import React from 'react';
import { GenericContextFactory } from './GenericContextFactory';
import {
  createEndpointDescriptor,
  getEndpointId,
} from '../utilities/EndpointUtilities';
import { withRfcContext } from './RfcContext';
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

export { EndpointsContextStore, EndpointsContext, withEndpointsContext };
