import React, { useEffect, useState } from 'react';
import TestingDashboard from '../dashboards/TestingDashboard';
import { useMockData } from '../../contexts/MockDataContext';

import { createExampleTestingService } from '../../services/testing/ExampleTestingService';

export default function TestingServiceLoader(props) {
  const debugData = useMockData();

  const [service, setService] = useState(null);
  useEffect(() => {
    if (debugData.available && debugData.loading) return; // wait until next time when example data has been fetched

    const serviceFactory = debugData.available
      ? () => createExampleTestingServiceFactory(debugData.data)
      : () => Promise.reject(new Error('TestingService not implemented yet'));

    const task = async () => {
      const s = await serviceFactory();
      setService(s);
    };
    task();
  }, [debugData.available, debugData.loading]);

  return <TestingDashboard service={service} {...props} />;
}

async function createExampleTestingServiceFactory(data) {
  const reportsExample =
    data.refs && data.refs.find(({ rel }) => rel === 'example-reports');

  return createExampleTestingService(reportsExample && reportsExample.id);
}
