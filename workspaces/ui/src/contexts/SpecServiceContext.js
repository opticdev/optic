import React, { useContext, useEffect, useState } from 'react';
import { GenericContextFactory } from './GenericContextFactory';

const {
  Context: SpecServiceContext,
  withContext: withSpecServiceContext,
} = GenericContextFactory(null);

class SpecServiceStore extends React.Component {
  componentDidMount() {
    const { specService, specServiceEvents } = this.props;
    if (!specServiceEvents) {
      console.warn('I need specServiceEvents');
      debugger;
    } else {
      specServiceEvents.on('events-updated', () => {
        this.forceUpdate();
      });
    }
  }

  render() {
    const { specService } = this.props;

    return (
      <SpecServiceContext.Provider value={{ specService }}>
        {this.props.children}
      </SpecServiceContext.Provider>
    );
  }
}

function useSpecService() {
  const { specService } = useContext(SpecServiceContext);
  return specService;
}

function useEnabledFeatures() {
  const specContext = useContext(SpecServiceContext);

  const [enabledFeatures, setEnabledFeatures] = useState(null);

  useEffect(() => {
    if (!specContext)
      throw Error(
        'useEnabledFeatures can only be used inside SpecServiceContext'
      );

    if (enabledFeatures !== null) return;

    const { specService } = specContext;
    const performRequest = async () => {
      const response = await specService.getTestingCredentials();

      const newEnabled = {
        TESTING_DASHBOARD: response.status >= 200 && response.status <= 299,
      };

      setEnabledFeatures(newEnabled);
    };

    performRequest().catch((err) => {
      console.error('Could not determine enabled features for user');
      throw err;
    });
  }, [enabledFeatures]);

  return enabledFeatures;
}

export {
  withSpecServiceContext,
  SpecServiceContext,
  SpecServiceStore,
  useSpecService,
  useEnabledFeatures,
};
