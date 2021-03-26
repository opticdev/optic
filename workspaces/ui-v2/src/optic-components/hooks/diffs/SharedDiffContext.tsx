import React, { useContext, useState } from 'react';
import {
  IPendingEndpoint,
  newSharedDiffMachine,
  SharedDiffStateContext,
} from './SharedDiffState';
// @ts-ignore
import * as shortId from 'shortid';
import { useMachine } from '@xstate/react';
import { PathComponentAuthoring } from '../../diffs/UndocumentedUrl';
import { useAllRequestsAndResponses } from './useAllRequestsAndResponses';
import { IEndpoint, useEndpoints } from '../useEndpointsHook';
import { IRequestBody, IResponseBody } from '../useEndpointBodyHook';

export const SharedDiffReactContext = React.createContext({});

type ISharedDiffContext = {
  context: SharedDiffStateContext;
  documentEndpoint: (pattern: string, method: string) => string;
  addIgnoreRule: (rule: string) => void;
  persistWIPPattern: (
    path: string,
    method: string,
    components: PathComponentAuthoring[]
  ) => void;
  getPendingEndpointById: (id: string) => IPendingEndpoint | undefined;
  wipPatterns: { [key: string]: PathComponentAuthoring[] };
  stageEndpoint: (id: string) => void;
  discardEndpoint: (id: string) => void;
  diffsGroupedByEndpoints: () => {
    pathId: string;
    method: string;
    fullPath: string;
    diffCount: number;
  }[];
};

export const SharedDiffStoreWithDependencies = (props: any) => {
  const allRequestsAndResponsesOfBaseSpec = useAllRequestsAndResponses();
  const allEndpointsOfBaseSpec = useEndpoints();

  // loaded
  if (
    allRequestsAndResponsesOfBaseSpec.data &&
    allEndpointsOfBaseSpec.endpoints
  ) {
    return (
      <SharedDiffStore
        endpoints={allEndpointsOfBaseSpec.endpoints}
        requests={allRequestsAndResponsesOfBaseSpec.data.requests}
        responses={allRequestsAndResponsesOfBaseSpec.data.responses}
      >
        {props.children}
      </SharedDiffStore>
    );
  } else {
    return <div>LOADING</div>;
  }
};

type SharedDiffStoreProps = {
  endpoints: IEndpoint[];
  requests: IRequestBody[];
  responses: IResponseBody[];
  children?: any;
};

const SharedDiffStore = (props: SharedDiffStoreProps) => {
  const [state, send]: any = useMachine(() =>
    newSharedDiffMachine({
      currentSpecEndpoints: props.endpoints,
      currentSpecRequests: props.requests,
      currentSpecResponses: props.responses,
    })
  );
  const context: SharedDiffStateContext = state.context;
  const [wipPatterns, setWIPPatterns] = useState<{
    [key: string]: PathComponentAuthoring[];
  }>({});

  const value: ISharedDiffContext = {
    context,
    diffsGroupedByEndpoints: () =>
      props.endpoints.map((endpoint) => {
        return {
          pathId: endpoint.pathId,
          fullPath: endpoint.fullPath,
          method: endpoint.method,
          diffCount: (
            context.results.diffHashesByEndpoints[
              `${endpoint.method}.${endpoint.pathId}`
            ] || []
          ).length,
        };
      }),
    documentEndpoint: (pattern: string, method: string) => {
      const uuid = shortId.generate();
      send({ type: 'DOCUMENT_ENDPOINT', pattern, method, pendingId: uuid });
      return uuid;
    },
    stageEndpoint: (id: string) =>
      send({ type: 'PENDING_ENDPOINT_STAGED', id }),
    discardEndpoint: (id: string) =>
      send({ type: 'PENDING_ENDPOINT_DISCARDED', id }),
    addIgnoreRule: (rule: string) => {
      send({ type: 'ADD_IGNORE_RULE', rule });
    },
    getPendingEndpointById: (id: string) => {
      return context.pendingEndpoints.find((i) => i.id === id);
    },
    persistWIPPattern: (
      path: string,
      method: string,
      components: PathComponentAuthoring[]
    ) =>
      setWIPPatterns((obj) => ({
        ...obj,
        [path + method]: components,
      })),
    wipPatterns,
  };

  return (
    <SharedDiffReactContext.Provider value={value}>
      {props.children}
    </SharedDiffReactContext.Provider>
  );
};

export function useSharedDiffContext() {
  return useContext(SharedDiffReactContext) as ISharedDiffContext;
}
