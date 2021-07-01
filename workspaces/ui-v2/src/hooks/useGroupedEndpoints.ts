import { useMemo } from 'react';
import groupBy from 'lodash.groupby';

import { IEndpoint } from '<src>/types';
import { findLongestCommonPath } from '<src>/utils';

export const useGroupedEndpoints = <T extends IEndpoint>(endpoints: T[]) => {
  return useMemo(() => {
    const commonStart = findLongestCommonPath(
      endpoints.map((endpoint) =>
        endpoint.pathParameters.map((pathParameter) => pathParameter.name)
      )
    );
    const endpointsWithGroups = endpoints.map((endpoint) => ({
      ...endpoint,
      // If there is only one endpoint, split['/'][1] returns undefined since
      // commonStart.length === endpoint.fullPath.length
      group: endpoint.fullPath.slice(commonStart.length).split('/')[1] || '',
    }));

    return groupBy(endpointsWithGroups, 'group');
  }, [endpoints]);
};
