import React, { FC } from 'react';
import { useContext } from 'react';
import { IOpticSpecRepository } from '@useoptic/spectacle';

export function useSpecRepository() {
  const specRepo = useContext(SpecRepositoryContext)!;
  if (!specRepo) {
    throw new Error('Could not find spectacle context');
  }
  return specRepo;
}

interface SpecRepositoryContextProps {
  specRepo: IOpticSpecRepository;
}

export const SpecRepositoryContext = React.createContext<IOpticSpecRepository | null>(
  null
);

export const SpecRepositoryStore: FC<SpecRepositoryContextProps> = (props) => {
  return (
    <SpecRepositoryContext.Provider value={props.specRepo}>
      {props.children}
    </SpecRepositoryContext.Provider>
  );
};
