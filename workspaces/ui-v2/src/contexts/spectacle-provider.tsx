import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SpectacleInput, IBaseSpectacle } from '@useoptic/spectacle';

import { AsyncStatus } from '<src>/types';

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

export const useSpectacleContext = () => {
  const value = useContext(SpectacleContext);
  if (!value) {
    throw new Error('Could not find spectacle context');
  }

  return value;
};

export function useSpectacleQuery<Result, Input = {}>(
  input: SpectacleInput<Input>
): AsyncStatus<Result> {
  const spectacle = useSpectacleContext();

  const [result, setResult] = useState<AsyncStatus<Result>>({
    loading: true,
  });

  const stringInput = JSON.stringify(input);
  useEffect(() => {
    async function task() {
      const result = await spectacle.query<Result, Input>(input);
      if (result.errors) {
        console.error(result.errors);
        debugger;
        setResult({
          loading: false,
          error: new Error(result.errors as any),
        });
      } else {
        setResult({
          loading: false,
          // We've explicitly checked that there are no errors
          data: result.data!,
        });
      }
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringInput, spectacle]);

  return result;
}

export function useSpectacleCommand(): <Result, Input = {}>(
  input: SpectacleInput<Input>
) => Promise<Result> {
  const spectacle = useSpectacleContext();

  return useCallback(
    async <Result, Input>(input: SpectacleInput<Input>): Promise<Result> => {
      const result = await spectacle.mutate<Result, Input>(input);
      if (result.errors) {
        console.error(result.errors);
        debugger;
        throw new Error('Error using spectacle command!');
      }

      // We've explicitly checked that there are no errors
      return result.data!;
    },
    [spectacle]
  );
}
