import { IEndpoint, IResponse } from '<src>/types';
import { getEndpointId } from '<src>/utils';

import { RootState } from '../root';

export const getEndpoint = ({
  pathId,
  method,
}: {
  pathId: string;
  method: string;
}) => (state: RootState) => {
  const endpointId = getEndpointId({ pathId, method });

  return state.endpoints.results.data?.endpoints.find(
    (endpoint) => getEndpointId(endpoint) === endpointId
  );
};

export const getResponsesInSortedOrder = (
  responses: IEndpoint['responsesByStatusCode']
): [string, IResponse[]][] => {
  return Object.entries(responses).sort(
    ([statusCode1], [statusCode2]) => Number(statusCode1) - Number(statusCode2)
  );
};
