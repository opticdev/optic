import * as React from 'react';
import { useContext, useState } from 'react';

export const ContributionEditContext = React.createContext({});

type ContributionEditContextValue = {
  isEditing: boolean;
  save: () => void;
  pendingCount: number;
  setEditing: (isEditing: boolean) => void;
  stagePendingContribution: (
    id: string,
    contributionKey: string,
    value: string
  ) => void;
  lookupContribution: (
    id: string,
    contributionKey: string
  ) => string | undefined;
};

interface IContribution {
  id: string;
  contributionKey: string;
  value: string;
}

export const ContributionEditingStore = (props: any) => {
  //@TODO: replace with spectacle
  /////////////////////////////////////////

  const [isEditing, setIsEditing] = useState(false);
  const [pendingContributions, setPendingContributions]: [
    IContribution[],
    any
  ] = useState([]);

  const stagePendingContribution = (
    id: string,
    contributionKey: string,
    value: string
  ) => {
    setPendingContributions((current: IContribution[]) => {
      const items = [...current];
      // remove previous changes for same id/key
      return [
        ...items.filter(
          (previous) =>
            previous.id !== id && previous.contributionKey !== contributionKey
        ),
        {
          id,
          contributionKey,
          value,
        },
      ];
    });
  };

  const value: ContributionEditContextValue = {
    isEditing,
    save: () => {
      setIsEditing(false);
      alert(JSON.stringify(pendingContributions));
      setPendingContributions(() => []);
    },
    pendingCount: pendingContributions.length,
    setEditing: (bool) => setIsEditing(bool),
    stagePendingContribution,
    lookupContribution: (id, contributionKey) => {
      return undefined;
    },
  };

  return (
    <ContributionEditContext.Provider value={value}>
      {props.children}
    </ContributionEditContext.Provider>
  );
};

export function useContributionEditing() {
  return useContext(ContributionEditContext) as ContributionEditContextValue;
}
