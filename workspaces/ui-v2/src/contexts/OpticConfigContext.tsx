import React, { FC } from 'react';
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
}

export const ConfigRepositoryContext = React.createContext<IOpticConfigRepository | null>(
  null
);

export const ConfigRepositoryStore: FC<ConfigServiceStoreProps> = (props) => {
  return (
    <ConfigRepositoryContext.Provider value={props.config}>
      {props.children}
    </ConfigRepositoryContext.Provider>
  );
};
