import React, { FC, useContext, useMemo, useState } from 'react';
import {
  IPendingEndpoint,
  newSharedDiffMachine,
  SharedDiffStateContext,
} from './SharedDiffState';
// @ts-ignore
import * as shortId from 'shortid';
import { useMachine } from '@xstate/react';
import { PathComponentAuthoring } from '<src>/optic-components/diffs/UndocumentedUrl';
import { IEndpoint } from '<src>/optic-components/hooks/useEndpointsHook';
import {
  IRequestBody,
  IResponseBody,
} from '<src>/optic-components/hooks/useEndpointBodyHook';
import { CurrentSpecContext } from '<src>/lib/Interfaces';
import { IOpticDiffService, IUnrecognizedUrl } from '@useoptic/spectacle';
import { newRandomIdGenerator } from '<src>/lib/domain-id-generator';
import { ParsedDiff } from '<src>/lib/parse-diff';
import { AddContribution, CQRSCommand } from '<src>/lib/command-factory';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { useOpticEngine } from '<src>/optic-components/hooks/useOpticEngine';
import { useConfigRepository } from '<src>/optic-components/hooks/useConfigHook';
import { useAnalytics } from '<src>/analytics';
import { IPath } from '<src>/optic-components/hooks/usePathsHook';

export const SharedDiffReactContext = React.createContext<ISharedDiffContext | null>(
  null
);

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
  approveCommandsForDiff: (diffHash: string, commands: CQRSCommand[]) => void;
  pendingEndpoints: IPendingEndpoint[];
  isDiffHandled: (diffHash: string) => boolean;
  currentSpecContext: CurrentSpecContext;
  reset: () => void;
  handledCount: [number, number];
  startedFinalizing: () => void;
  setEndpointName: (id: string, name: string) => void;
  setPathDescription: (
    pathId: string,
    description: string,
    endpointId: string
  ) => void;
  setPendingEndpointName: (id: string, name: string) => void;
  getContributedEndpointName: (endpointId: string) => string | undefined;
  getContributedPathDescription: (pathId: string) => string | undefined;
  captureId: string;
  commitModalOpen: boolean;
  setCommitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasDiffChanges: () => boolean;
  diffService: IOpticDiffService;
};

type SharedDiffStoreProps = {
  endpoints: IEndpoint[];
  captureId: string;
  requests: IRequestBody[];
  responses: IResponseBody[];
  allPaths: IPath[];
  diffs: ParsedDiff[];
  diffService: IOpticDiffService;
  diffTrails: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
  urls: IUnrecognizedUrl[];
};

export const SharedDiffStore: FC<SharedDiffStoreProps> = (props) => {
  const opticEngine = useOpticEngine();

  const { config } = useConfigRepository();

  const currentSpecContext: CurrentSpecContext = {
    currentSpecPaths: props.allPaths,
    currentSpecEndpoints: props.endpoints,
    currentSpecRequests: props.requests,
    currentSpecResponses: props.responses,
    domainIds: newRandomIdGenerator(),
    idGeneratorStrategy: 'random',
    opticEngine,
  };

  const [state, send]: any = useMachine(() =>
    newSharedDiffMachine(
      currentSpecContext,
      props.diffs,
      props.urls,
      props.diffTrails,
      props.diffService,
      config
    )
  );

  const context: SharedDiffStateContext = state.context;

  const isDiffHandled = (diffHash: string) => {
    return (
      context.choices.approvedSuggestions.hasOwnProperty(diffHash) ||
      context.browserDiffHashIgnoreRules.includes(diffHash)
    );
  };

  const analytics = useAnalytics();

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
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    JSON.stringify(Object.keys(state.context.choices.approvedSuggestions)),
    JSON.stringify(state.context.browserDiffHashIgnoreRules),
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const [wipPatterns, setWIPPatterns] = useState<{
    [key: string]: PathComponentAuthoring[];
  }>({});

  const [commitModalOpen, setCommitModalOpen] = useState(false);

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
    approveCommandsForDiff: (diffHash: string, commands: CQRSCommand[]) => {
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
    reset: () => {
      analytics.userResetDiff(handled, total);
      send({ type: 'RESET' });
    },
    handledCount: [handled, total],
    startedFinalizing: () => send({ type: 'USER_FINISHED_REVIEW' }),
    setEndpointName: (id: string, name: string) =>
      send({
        type: 'SET_ENDPOINT_NAME',
        id,
        command: AddContribution(id, 'purpose', name),
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
    setPathDescription: (
      pathId: string,
      description: string,
      endpointId: string
    ) => {
      send({
        type: 'SET_PATH_DESCRIPTION',
        pathId,
        command: AddContribution(pathId, 'description', description),
        endpointId,
      });
    },
    captureId: props.captureId,
    getContributedEndpointName: (endpointId: string): string | undefined => {
      return context.choices.existingEndpointNameContributions[endpointId]
        ?.AddContribution.value;
    },
    getContributedPathDescription: (pathId: string): string | undefined => {
      return context.choices.existingEndpointPathContributions[pathId]?.command
        .AddContribution.value;
    },
    diffService: props.diffService,
    commitModalOpen,
    setCommitModalOpen,
    hasDiffChanges: () =>
      handled > 0 ||
      context.pendingEndpoints.filter((i) => i.staged).length > 0 ||
      Object.keys(context.choices.existingEndpointNameContributions).length >
        0 ||
      Object.keys(context.choices.existingEndpointPathContributions).length > 0,
  };

  return (
    <SharedDiffReactContext.Provider value={value}>
      {props.children}
    </SharedDiffReactContext.Provider>
  );
};

export function useSharedDiffContext() {
  return useContext(SharedDiffReactContext)!;
}
