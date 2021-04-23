import * as React from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { AddContribution } from '../../../lib/command-factory';
import { useContributions } from '../useContributions';

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

export const useValueWithStagedContributions = (
  id: string,
  contributionKey: string
) => {
  const {
    lookupContribution,
    stagePendingContribution,
  } = useContributionEditing();

  const initialValue = lookupContribution(id, contributionKey);
  const [value, setValue] = useState<string>(initialValue || '');
  useEffect(() => {
    stagePendingContribution(id, contributionKey, value);
  }, [id, contributionKey, value, stagePendingContribution]);

  return {
    value,
    setValue,
  };
};

export const ContributionEditingStore = (
  props: ContributionEditingStoreProps
) => {
  const spectacleMutator = useSpectacleCommand();
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

  const value: ContributionEditContextValue = {
    isEditing,
    save: async () => {
      if (pendingContributions.length > 0) {
        const commands = pendingContributions.map((contribution) =>
          AddContribution(
            contribution.id,
            contribution.contributionKey.toUpperCase(), // TODO validate that this should be uppercase?
            contribution.value
          )
        );

        // TODO error handling
        await spectacleMutator({
          query: `
          mutation X($commands: [JSON]) {
            applyCommands(commands: $commands) {
              batchCommitId
            }
          }
          `,
          variables: {
            commands,
          },
        });

        setPendingContributions([]);
      }
      setIsEditing(false);
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
