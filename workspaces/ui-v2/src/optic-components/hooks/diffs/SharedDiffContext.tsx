import React, { useContext } from 'react';
import {
  newSharedDiffMachine,
  SharedDiffStateContext,
} from './SharedDiffState';
import { useMachine } from '@xstate/react';

export const SharedDiffReactContext = React.createContext({});

type ISharedDiffContext = {
  context: SharedDiffStateContext;
  documentEndpoint: (pattern: string, method: string) => void;
  addIgnoreRule: (rule: string) => void;
};

export const SharedDiffStore = (props: any) => {
  const [state, send]: any = useMachine(() => newSharedDiffMachine());
  const context: SharedDiffStateContext = state.context;

  const value: ISharedDiffContext = {
    context,
    documentEndpoint: (pattern: string, method: string) => {
      send({ type: 'DOCUMENT_ENDPOINT', pattern, method });
    },
    addIgnoreRule: (rule: string) => {
      send({ type: 'ADD_IGNORE_RULE', rule });
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
