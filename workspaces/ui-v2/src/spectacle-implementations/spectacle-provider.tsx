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

export function useSpectacleQuery<Result, Input = {}>(
  input: SpectacleInput<Input>
): AsyncStatus<Result> {
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState<AsyncStatus<any>>({
    loading: true,
  });

  const stringInput = JSON.stringify(input);
  useEffect(() => {
    async function task() {
      const result = await spectacle.query(input);
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
  const spectacle = useContext(SpectacleContext)!;

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
