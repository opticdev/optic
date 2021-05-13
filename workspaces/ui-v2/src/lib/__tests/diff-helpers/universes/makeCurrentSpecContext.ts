import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
} from '<src>/optic-components/hooks/useEndpointsHook';
import { SpectacleInput } from '@useoptic/spectacle/build';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '<src>/optic-components/hooks/diffs/useAllRequestsAndResponses';
import { newDeterministicIdGenerator } from '<src>/lib/domain-id-generator';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { AllPathsQuery } from '<src>/optic-components/hooks/usePathsHook';

//@GOTCHA: for some reason, probably because of jest, our wasm code thinks it is running in the browser even though it is running in node because of the presence of global.self:
//@REF: https://github.com/rust-random/getrandom/issues/214
//@ts-ignore
delete global.self;

export async function makeCurrentSpecContext(
  events: any[],
  query: (spectacleInput: SpectacleInput<any>) => Promise<any>
): Promise<CurrentSpecContext> {
  const endpoints = endpointQueryResultsToJson(
    (
      await query({
        query: AllEndpointsQuery,
        variables: {},
      })
    ).data
  );

  const { requests, responses } = queryResultToAllRequestsResponses(
    (
      await query({
        query: AllRequestsAndResponsesQuery,
        variables: {},
      })
    ).data
  );

  const { paths } = (
    await query({
      query: AllPathsQuery,
      variables: {},
    })
  ).data;

  return {
    currentSpecPaths: paths,
    currentSpecEndpoints: endpoints,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
    idGeneratorStrategy: 'sequential',
    opticEngine,
  };
}
