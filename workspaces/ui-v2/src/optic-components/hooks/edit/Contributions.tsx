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

type ContributionEditingStoreProps = {
  initialIsEditingState?: boolean;
  children?: any;
};

// Keyed by id -> contributionKey -> value
type PendingContributions = Map<string, Map<string, string>>;

export const ContributionEditingStore = (
  props: ContributionEditingStoreProps
) => {
  const [isEditing, setIsEditing] = useState(
    props.initialIsEditingState || false
  );

  const [pendingContributions, setPendingContributions] = useState<PendingContributions>(new Map());

  const stagePendingContribution = useCallback(
    (
      newId: string,
      newContributionKey: string,
      newValue: string
    ) => {
      setPendingContributions((previousState) => {
        const newState: PendingContributions = new Map(previousState);
        if (previousState.has(newId)) {
          const contributionsMap = previousState.get(newId)!;
          const contributionsToSave = [...contributionsMap].filter(([k, _]) => {
            const isCurrentContribution = k === newContributionKey;
            // @nic TODO filter out if this is the old state that's saved in our BE
            // i.e. we should only issue commands when something has actually changed
            return !isCurrentContribution
          }).concat([[
            newContributionKey, newValue
          ]]);

          if (contributionsToSave.length > 0) {
            newState.set(newId, new Map(contributionsToSave))
          }
        } else {
          newState.set(newId, new Map([[newContributionKey, newValue]]))
        }

        return newState;
      });
    }, []
  );

  const value: ContributionEditContextValue = {
    isEditing,
    save: () => {
      setIsEditing(false);
      // @nic TODO - implement at spectacle
      // TODO mutate this into the correct mutation for spectacle
      console.log(pendingContributions)
      alert(JSON.stringify(pendingContributions));
      setPendingContributions(() => new Map());
    },
    pendingCount: [...pendingContributions].reduce((acc, [, map]) => acc + map.size, 0),
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
