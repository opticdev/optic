import React, { useEffect, useState } from 'react';
import TestingDashboard from '../dashboards/TestingDashboard';

import { createExampleTestingService } from '../../services/TestingService';

export function createTestingServiceLoaderComponent(serviceFactory) {
  return function(props) {
    const { match } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [service, setService] = useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const task = async () => {
        const s = await serviceFactory(props);
        setService(s);
      };
      task();
    }, []);

    return <TestingDashboard service={service} {...props} />;
  };
}

export function createExampleTestingServiceLoaderComponent() {
  return createTestingServiceLoaderComponent((props) =>
    createExampleTestingService(props.match.params.exampleId)
  );
}

export const ExampleTestingServiceLoaderComponent = createExampleTestingServiceLoaderComponent();
