import React, { useContext } from 'react';
import { IPendingEndpoint } from './SharedDiffState';
import { useMachine } from '@xstate/react';
import {
  IIgnoreBody,
  newLearnPendingEndpointMachine,
} from './LearnPendingEndpointState';
import { ILearnedBodies } from '../../../../../cli-shared/build/diffs/initial-types';

export const LearnedPendingEndpointContext = React.createContext({});

type ILearnedPendingEndpointContext = {
  endpoint: IPendingEndpoint;
  isLoading: boolean;
  isReady: boolean;
  learnedBodies?: ILearnedBodies;
  ignoredBodies: IIgnoreBody[];
  ignoreBody: (ignoreBody: IIgnoreBody) => void;
  includeBody: (ignoreBody: IIgnoreBody) => void;
  stageEndpoint: () => void;
  discardEndpoint: () => void;
};

export const ILearnedPendingEndpointStore = ({
  endpoint,
  children,
  onEndpointStaged,
  onEndpointDiscarded,
}: {
  children: any;
  endpoint: IPendingEndpoint;
  onEndpointStaged: () => void;
  onEndpointDiscarded: () => void;
}) => {
  const [state, send]: any = useMachine(() =>
    newLearnPendingEndpointMachine(endpoint, () => {})
  );

  const context: ILearnedPendingEndpointContext = state.context;

  const value: ILearnedPendingEndpointContext = {
    endpoint,
    isLoading: state.matches('loading'),
    isReady: state.matches('ready'),
    learnedBodies: context.learnedBodies,
    ignoredBodies: context.ignoredBodies,
    ignoreBody: (ignoreBody: IIgnoreBody) => {
      send({ type: 'USER_IGNORED_BODY', ignored: ignoreBody });
    },
    includeBody: (ignoreBody: IIgnoreBody) => {
      send({ type: 'USER_INCLUDED_BODY', removeIgnore: ignoreBody });
    },
    stageEndpoint: onEndpointStaged,
    discardEndpoint: onEndpointDiscarded,
  };
  return (
    <LearnedPendingEndpointContext.Provider value={value}>
      {children}
    </LearnedPendingEndpointContext.Provider>
  );
};

export function useLearnedPendingEndpointContext() {
  return useContext(
    LearnedPendingEndpointContext
  ) as ILearnedPendingEndpointContext;
}
