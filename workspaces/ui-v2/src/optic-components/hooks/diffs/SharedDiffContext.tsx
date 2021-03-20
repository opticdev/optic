import React, { useContext, useState } from 'react';
import {
  newSharedDiffMachine,
  SharedDiffStateContext,
} from './SharedDiffState';
// @ts-ignore
import * as shortId from 'shortid';
import { useMachine } from '@xstate/react';
import { PathComponentAuthoring } from '../../diffs/UndocumentedUrl';

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
  wipPatterns: { [key: string]: PathComponentAuthoring[] };
};

export const SharedDiffStore = (props: any) => {
  const [state, send]: any = useMachine(() => newSharedDiffMachine());
  const context: SharedDiffStateContext = state.context;
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
    addIgnoreRule: (rule: string) => {
      send({ type: 'ADD_IGNORE_RULE', rule });
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
