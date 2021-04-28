import React, { ReactNode, useContext } from 'react';
import { IOpticEngine } from '@useoptic/spectacle';
import invariant from 'invariant';
const OpticEngineContext = React.createContext<IOpticEngine | null>(null);

export function OpticEngineStore(props: {
  children: ReactNode;
  opticEngine: IOpticEngine;
}) {
  return (
    <OpticEngineContext.Provider
      children={props.children}
      value={props.opticEngine}
    />
  );
}

export function useOpticEngine(): IOpticEngine {
  const value = useContext(OpticEngineContext);
  invariant(value, 'useOpticEngine could not find OpticEngineContext');
  return value!;
}
