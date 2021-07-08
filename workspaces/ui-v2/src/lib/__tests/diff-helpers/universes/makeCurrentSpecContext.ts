import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
  EndpointQueryResults,
} from '<src>/store/endpoints/thunks';
import { IBaseSpectacle } from '@useoptic/spectacle';
import { newDeterministicIdGenerator } from '<src>/lib/domain-id-generator';
import * as opticEngine from '@useoptic/optic-engine-wasm';
import { AllPathsQuery, PathQueryResponse } from '<src>/hooks/usePathsHook';
import { IQueryParameters, IRequestBody } from '<src>/types';

//@GOTCHA: for some reason, probably because of jest, our wasm code thinks it is running in the browser even though it is running in node because of the presence of global.self:
//@REF: https://github.com/rust-random/getrandom/issues/214
//@ts-ignore
delete global.self;

export async function makeCurrentSpecContext(
  events: any[],
  query: IBaseSpectacle['query']
): Promise<CurrentSpecContext> {
  const { endpoints } = endpointQueryResultsToJson(
    (
      await query<EndpointQueryResults>({
        query: AllEndpointsQuery,
        variables: {},
      })
    ).data || {
      requests: [],
    },
    null
  );
  const { paths } = (
    await query<PathQueryResponse>({
      query: AllPathsQuery,
      variables: {},
    })
  ).data || { paths: [] };
  const requests = endpoints
    .flatMap((endpoint) => endpoint.requestBodies)
    .filter((body) => !!body) as IRequestBody[]; // cast to IRequestBody as filter removes non-null
  const queryParameters = endpoints
    .map((endpoint) => endpoint.query)
    .filter((query) => !!query) as IQueryParameters[];

  const responses = endpoints.flatMap((endpoint) => endpoint.responseBodies);

  return {
    currentSpecPaths: paths,
    currentSpecEndpoints: endpoints,
    currentSpecQueryParameters: queryParameters,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
    idGeneratorStrategy: 'sequential',
    opticEngine,
  };
}
