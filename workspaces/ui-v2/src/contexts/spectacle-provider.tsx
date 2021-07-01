import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SpectacleInput, IForkableSpectacle } from '@useoptic/spectacle';
import * as Sentry from '@sentry/react';
import { AsyncStatus } from '<src>/types';

export const SpectacleContext = React.createContext<IForkableSpectacle | null>(
  null
);

export const SpectacleStore = (props: {
  spectacle: IForkableSpectacle;
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
      try {
        const result = await spectacle.query<Result, Input>(input);
        if (result.errors) {
          throw new Error(JSON.stringify(result.errors));
        }
        setResult({
          loading: false,
          // We've explicitly checked that there are no errors
          data: result.data!,
        });
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        setResult({
          loading: false,
          error: new Error(e),
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
      try {
        const result = await spectacle.mutate<Result, Input>(input);
        if (result.errors) {
          console.error(result.errors);
          throw new Error(JSON.stringify(result.errors));
        }
        return result.data!;
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        throw new Error(e);
      }
    },
    [spectacle]
  );
}
