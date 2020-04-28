import React from 'react';
import theme from '../../decorators/theme';
import card from '../../decorators/card';
import { EndpointReport } from '../../../components/testing/EndpointReport';

export default {
  title: 'Testing/EndpointReport',
  decorators: [theme, card],
};

export function LoadingEndpointSummary() {
  return (
    <EndpointReport
      endpointPurpose={'GET List of favorite drivers'}
      endpointCounts={{
        interactions: 12,
        compliant: 9,
        incompliant: 3,
        diffs: 1,
      }}
      loadingDiffSummary={true}
      diffsSummary={null}
    />
  );
}
