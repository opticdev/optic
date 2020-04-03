import React, { useEffect, useState } from 'react';
import TestingDashboard from '../dashboards/TestingDashboard';
import { useMockData } from '../../contexts/MockDataContext';

import { createExampleTestingService } from '../../services/TestingService';

export default function TestingServiceLoader(props) {
  const debugData = useMockData();

  const [service, setService] = useState(null);
  useEffect(() => {

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
  const testingLink =
    data.links && data.links.find(({ rel }) => rel === 'testing');

  return createExampleTestingService(testingLink && testingLink.href);
}
