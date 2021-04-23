import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SpectacleInput, IBaseSpectacle } from '@useoptic/spectacle';

export type AsyncStatus<T> =
  | {
      loading: true;
      error: false;
      data: null;
    }
  | {
      loading: false;
      error: true;
      data: null;
    }
  | { loading: false; error: false; data: T };

export const SpectacleContext = React.createContext<IBaseSpectacle | null>(
  null
);

export const SpectacleStore = (props: {
  spectacle: IBaseSpectacle;
  children: React.ReactNode;
}) => {
  return (
    <SpectacleContext.Provider value={props.spectacle}>
      {props.children}
    </SpectacleContext.Provider>
  );
};

export function useSpectacleQuery(input: SpectacleInput): AsyncStatus<any> {
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState<AsyncStatus<any>>({
    loading: true,
    error: false,
    data: null,
  });

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

export function useSpectacleCommand(): (input: SpectacleInput) => Promise<any> {
  const spectacle = useContext(SpectacleContext)!;

  return useCallback(
    (input: SpectacleInput) => {
      // @nic TODO error handling
      return spectacle.mutate(input);
    },
    [spectacle]
  );
}
