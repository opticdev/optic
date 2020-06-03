import React, { useEffect, useState } from 'react';
import TestingDashboard, {
  TestingDashboardSetupPage,
} from '../dashboards/TestingDashboard';
import { useMockData } from '../../contexts/MockDataContext';
import {
  useSpecService,
  useEnabledFeatures,
} from '../../contexts/SpecServiceContext';

import { createExampleTestingService } from '../../services/testing/ExampleTestingService';
import { TestingService } from '../../services/testing/TestingService';
import Config from '../../config';

export default function TestingServiceLoader(props) {
  const debugData = useMockData();

  const [service, setService] = useState(null);
  const specService = useSpecService();
  const enabledFeatures = useEnabledFeatures();

  useEffect(() => {
    if (
      (debugData.available && debugData.loading) || // wait until next time when example data has been fetched
      !enabledFeatures ||
      !enabledFeatures.TESTING_DASHBOARD // don't setup if we're not sure testing is enabled
    )
      return;

    const serviceFactory = debugData.available
      ? () => createExampleTestingServiceFactory(debugData.data)
      : async () =>
          new TestingService(
            specService.getTestingCredentials.bind(specService),
            Config.testingService.baseUrl
          );

    const task = async () => {
      const s = await serviceFactory();
      setService(s);
    };
    task();
  }, [debugData.available, debugData.loading, specService]);

  if (enabledFeatures && !enabledFeatures.TESTING_DASHBOARD) {
    return <TestingDashboardSetupPage />;
  }

  return <TestingDashboard service={service} {...props} />;
}

async function createExampleTestingServiceFactory(data) {
  const reportsExample =
    data.refs && data.refs.find(({ rel }) => rel === 'example-reports');

  return createExampleTestingService(reportsExample && reportsExample.id);
}
