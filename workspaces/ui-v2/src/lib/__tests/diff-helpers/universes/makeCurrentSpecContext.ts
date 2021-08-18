import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
  EndpointQueryResults,
} from '<src>/store/endpoints/thunks';
import { IBaseSpectacle } from '@useoptic/spectacle';
import { newDeterministicIdGenerator } from '<src>/lib/domain-id-generator';
import * as opticEngine from '@useoptic/optic-engine-wasm';
import { AllPathsQuery, PathQueryResponse } from '<src>/store/paths/thunks';

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
      endpoints: [],
    },
    null,
    false
  );
  const { paths } = (
    await query<PathQueryResponse>({
      query: AllPathsQuery,
      variables: {},
    })
  ).data || { paths: [] };

  return {
    currentSpecPaths: paths,
    currentSpecEndpoints: endpoints,
    domainIds: newDeterministicIdGenerator(),
    idGeneratorStrategy: 'sequential',
    opticEngine,
  };
}
