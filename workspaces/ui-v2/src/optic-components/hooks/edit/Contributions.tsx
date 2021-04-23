import * as React from 'react';
import { useCallback, useContext, useState } from 'react';

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

type ContributionEditingStoreProps = {
  initialIsEditingState?: boolean;
  children?: any;
};

export const ContributionEditingStore = (
  props: ContributionEditingStoreProps
) => {
  const [isEditing, setIsEditing] = useState(
    props.initialIsEditingState || false
  );

  const [pendingContributions, setPendingContributions] = useState<
    IContribution[]
  >([]);

  const stagePendingContribution = useCallback(
    (newId: string, newContributionKey: string, newValue: string) => {
      // @nic TODO change this to look at query diff vs user input
      const newContribution =
        newValue !== ''
          ? [
              {
                id: newId,
                contributionKey: newContributionKey,
                value: newValue,
              },
            ]
          : [];

      setPendingContributions((previousState) => [
        ...previousState.filter((previousItem) => {
          const isCurrentContribution =
            previousItem.id === newId &&
            previousItem.contributionKey === newContributionKey;
          return !isCurrentContribution;
        }),
        ...newContribution,
      ]);
    },
    []
  );
  console.log(pendingContributions);

  const value: ContributionEditContextValue = {
    isEditing,
    save: () => {
      setIsEditing(false);
      // @nic TODO - implement at spectacle
      // TODO mutate this into the correct mutation for spectacle
      console.log(pendingContributions);
      alert(JSON.stringify(pendingContributions));
      setPendingContributions([]);
    },
    pendingCount: pendingContributions.length,
    setEditing: (bool) => setIsEditing(bool),
    stagePendingContribution,
    lookupContribution: (id, contributionKey) => {
      // @nic TODO implement fetch for store to load this information
      // TODO handle loading state when this isn't loaded
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
