import * as React from 'react';
import { useContext } from 'react';
import { IOpticConfigRepository } from '@useoptic/spectacle';

export function useConfigRepository(): {
  config: IOpticConfigRepository;
} {
  const config = useContext(ConfigRepositoryContext)!;
  return {
    config,
  };
}

interface ConfigServiceStoreProps {
  config: IOpticConfigRepository;
  children: any;
}

export const ConfigRepositoryContext = React.createContext<IOpticConfigRepository | null>(
  null
);

export function ConfigRepositoryStore(props: ConfigServiceStoreProps) {
  return (
    <ConfigRepositoryContext.Provider value={props.config}>
      {props.children}
    </ConfigRepositoryContext.Provider>
  );
}
