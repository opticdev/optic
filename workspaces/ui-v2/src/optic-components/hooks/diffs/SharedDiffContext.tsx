import React, { FC, useContext, useMemo, useState } from 'react';
import {
  IPendingEndpoint,
  newSharedDiffMachine,
  SharedDiffStateContext,
} from './SharedDiffState';
// @ts-ignore
import * as shortId from 'shortid';
import { useMachine } from '@xstate/react';
import { PathComponentAuthoring } from '../../diffs/UndocumentedUrl';
import { IEndpoint } from '../useEndpointsHook';
import { IRequestBody, IResponseBody } from '../useEndpointBodyHook';
import { CurrentSpecContext } from '../../../lib/Interfaces';
import {
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IUnrecognizedUrl,
} from '@useoptic/spectacle';
import { newRandomIdGenerator } from '../../../lib/domain-id-generator';
import { ParsedDiff } from '../../../lib/parse-diff';
import { InteractionLoaderContext } from '../../../spectacle-implementations/interaction-loader';
import { learnTrailsForParsedDiffs } from '../../../lib/__scala_kill_me/browser-trail-learners-dep';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';

export const SharedDiffReactContext = React.createContext({});

type ISharedDiffContext = {
  context: SharedDiffStateContext;
  documentEndpoint: (pattern: string, method: string) => string;
  addPathIgnoreRule: (rule: string) => void;
  addDiffHashIgnore: (diffHash: string) => void;
  persistWIPPattern: (
    path: string,
    method: string,
    components: PathComponentAuthoring[]
  ) => void;
  getPendingEndpointById: (id: string) => IPendingEndpoint | undefined;
  wipPatterns: { [key: string]: PathComponentAuthoring[] };
  stageEndpoint: (id: string) => void;
  discardEndpoint: (id: string) => void;
  approveCommandsForDiff: (diffHash: string, commands: any[]) => void;
  pendingEndpoints: IPendingEndpoint[];
  isDiffHandled: (diffHash: string) => boolean;
  currentSpecContext: CurrentSpecContext;
  reset: () => void;
  handledCount: [number, number];
  startedFinalizing: () => void;
  setEndpointName: (id: string, command: any) => void;
  setPendingEndpointName: (id: string, name: string) => void;
};

type SharedDiffStoreProps = {
  endpoints: IEndpoint[];
  requests: IRequestBody[];
  responses: IResponseBody[];
  diffs: any;
  diffTrails: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
  urls: IUnrecognizedUrl[];
};

export const SharedDiffStore: FC<SharedDiffStoreProps> = (props) => {
  const currentSpecContext: CurrentSpecContext = {
    currentSpecEndpoints: props.endpoints,
    currentSpecRequests: props.requests,
    currentSpecResponses: props.responses,
    domainIds: newRandomIdGenerator(),
  };

  const parsedDiffs = useMemo(
    () => props.diffs.map((i: any) => new ParsedDiff(i[0], i[1], i[2])),
    [props.diffs]
  );

  const { allSamples } = useContext(InteractionLoaderContext);

  const trailsLearned = learnTrailsForParsedDiffs(
    parsedDiffs,
    currentSpecContext,
    //@ts-ignore
    window.events,
    allSamples
  );

  //@dev here is where the diff output needs to go
  const [state, send]: any = useMachine(() =>
    newSharedDiffMachine(
      currentSpecContext,
      parsedDiffs,
      props.urls.map((i) => ({ ...i })),
      trailsLearned, //props.diffTrails
      allSamples,
      //@ts-ignore
      {
        listDiffs(): Promise<IListDiffsResponse> {
          return Promise.resolve({ diffs: [] });
        },
        listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
          return Promise.resolve({ urls: [] });
        },
      }
    )
  );

  const context: SharedDiffStateContext = state.context;

  const isDiffHandled = (diffHash: string) => {
    return (
      context.choices.approvedSuggestions.hasOwnProperty(diffHash) ||
      context.browserDiffHashIgnoreRules.includes(diffHash)
    );
  };

  const [handled, total] = useMemo(() => {
    return context.results.diffsGroupedByEndpoint.reduce(
      (current, grouping) => {
        const handledCount = grouping.shapeDiffs.filter((i) =>
          isDiffHandled(i.diffHash())
        ).length;
        const total =
          grouping.shapeDiffs.length + grouping.newRegionDiffs.length;

        return [current[0] + handledCount, current[1] + total];
      },
      [0, 0]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Object.keys(state.context.choices.approvedSuggestions))]);

  const [wipPatterns, setWIPPatterns] = useState<{
    [key: string]: PathComponentAuthoring[];
  }>({});

  const value: ISharedDiffContext = {
    context,
    documentEndpoint: (pattern: string, method: string) => {
      const uuid = shortId.generate();
      send({ type: 'DOCUMENT_ENDPOINT', pattern, method, pendingId: uuid });
      return uuid;
    },
    stageEndpoint: (id: string) =>
      send({ type: 'PENDING_ENDPOINT_STAGED', id }),
    discardEndpoint: (id: string) =>
      send({ type: 'PENDING_ENDPOINT_DISCARDED', id }),
    addPathIgnoreRule: (rule: string) => {
      send({ type: 'ADD_PATH_IGNORE_RULE', rule });
    },
    getPendingEndpointById: (id: string) => {
      return context.pendingEndpoints.find((i) => i.id === id);
    },
    pendingEndpoints: context.pendingEndpoints,
    isDiffHandled,
    approveCommandsForDiff: (diffHash: string, commands: any[]) => {
      send({ type: 'COMMANDS_APPROVED_FOR_DIFF', diffHash, commands });
    },
    addDiffHashIgnore: (diffHash: string) =>
      send({ type: 'ADD_DIFF_HASH_IGNORE', diffHash }),
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
    currentSpecContext,
    reset: () => send({ type: 'RESET' }),
    handledCount: [handled, total],
    startedFinalizing: () => send({ type: 'USER_FINISHED_REVIEW' }),
    setEndpointName: (id: string, command: any) =>
      send({
        type: 'SET_ENDPOINT_NAME',
        id,
        command,
      }),
    setPendingEndpointName: (id: string, name) => {
      const pendingEndpoint = context.pendingEndpoints.find((i) => i.id === id);
      if (!pendingEndpoint) {
        return console.error(`Could not find pending endpoint with id ${id}`);
      }
      pendingEndpoint.ref.send({ type: 'STAGED_ENDPOINT_NAME_UPDATED', name });
      send({
        type: 'UPDATE_PENDING_ENDPOINT_NAME',
      });
    },
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
