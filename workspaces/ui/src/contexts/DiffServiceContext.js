import * as React from 'react';
import { useContext } from 'react';

export const DiffServiceContext = React.createContext();

export function useDiffServiceContext() {
  const { diffServiceFactory } = useContext(DiffServiceContext);
  return {
    diffServiceFactory,
  };
}
