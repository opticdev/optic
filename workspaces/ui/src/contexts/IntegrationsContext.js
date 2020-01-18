import {GenericContextFactory} from './GenericContextFactory';
import React from 'react';

const {
  Context: IntegrationsContext,
  withContext: withIntegrationsContext
} = GenericContextFactory(null)

class IntegrationsContextStore extends React.Component {
  render() {
    const context = {
      integrations: this.props.integrations,
      goToIntegration: (baseUrl, name) => {
        return `${baseUrl}/integrations/${encodeURIComponent(name)}`
      },
      isIntegrationMode: this.props.isIntegrationMode || false
    }
    return (
      <IntegrationsContext.Provider value={context}>
        {this.props.children}
      </IntegrationsContext.Provider>
    )
  }
}

export {
  IntegrationsContextStore,
  withIntegrationsContext
}
