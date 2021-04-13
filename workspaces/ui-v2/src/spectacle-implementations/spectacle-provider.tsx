import React, { useContext, useEffect, useState } from 'react';
import { SpectacleInput, IBaseSpectacle } from '@useoptic/spectacle';
//@TODO find some better way to represent this kind of thing with Typescript
export type AsyncStatus<T> = { loading: boolean; error?: Error; data?: T };

export const SpectacleContext = React.createContext<IBaseSpectacle | null>(
  null,
);

export const SpectacleStore = (props: {
  spectacle: IBaseSpectacle;
  children: any;
}) => {
  return (
    <SpectacleContext.Provider value={props.spectacle}>
      {props.children}
    </SpectacleContext.Provider>
  );
};

export function useSpectacleQuery(input: SpectacleInput): AsyncStatus<any> {
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState({ loading: true });

  const stringInput = JSON.stringify(input);
  useEffect(() => {
    async function task() {
      const result = await spectacle.query(input);
      if (result.errors) {
        console.error(result.errors);
        debugger;
        result.error = new Error(result.errors);
      }
      setResult(result);
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringInput, spectacle]);

  return result;
}
export function useSpectacleCommand(input: SpectacleInput): AsyncStatus<any> {
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState({ loading: true });

  const stringInput = JSON.stringify(input);
  useEffect(() => {
    async function task() {
      const result = await spectacle.mutate(input);
      if (result.errors) {
        console.error(result.errors);
        debugger;
        result.error = new Error(result.errors);
      }
      setResult(result);
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringInput]);

  return result;
}
