import { AsyncStatus, Spectacle } from './public-examples';
import React, { useContext, useEffect, useState } from 'react';
import { SpectacleInput } from '@useoptic/spectacle';

export const SpectacleContext = React.createContext({});

export const SpectacleStore = (props: {
  spectacle: Spectacle;
  children: any;
}) => {
  return (
    <SpectacleContext.Provider value={props.spectacle}>
      {props.children}
    </SpectacleContext.Provider>
  );
};

export function useSpectacleQuery(input: SpectacleInput): AsyncStatus<any> {
  const { query } = useContext(SpectacleContext) as Spectacle;
  const [result, setResult] = useState({ loading: true });

  const stringInput = JSON.stringify(input);
  useEffect(() => {
    async function task() {
      const result = await query(input);
      setResult(result);
    }
    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringInput]);

  return result;
}
