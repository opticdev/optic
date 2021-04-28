import * as React from 'react';
import { FC, useCallback, useContext, useState } from 'react';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { AddContribution } from '../../../lib/command-factory';

export const ContributionEditContext = React.createContext({});

type ContributionEditContextValue = {
  isEditing: boolean;
  save: () => void;
  pendingCount: number;
  setEditing: (isEditing: boolean) => void;
  stagePendingContribution: (
    id: string,
    contributionKey: string,
    value: string,
    initialValue: string
  ) => void;
};

interface IContribution {
  id: string;
  contributionKey: string;
  value: string;
}

type ContributionEditingStoreProps = {
  initialIsEditingState?: boolean;
};

export const useValueWithStagedContributions = (
  id: string,
  contributionKey: string,
  initialValue: string
) => {
  const { stagePendingContribution } = useContributionEditing();

  const [value, setValue] = useState<string>(initialValue || '');
  const setValueWithPendingContribution = useCallback(
    (newValue: string) => {
      setValue(newValue);
      stagePendingContribution(id, contributionKey, newValue, initialValue);
    },
    [id, contributionKey, stagePendingContribution, initialValue]
  );

  return {
    value,
    setValue: setValueWithPendingContribution,
  };
};

export const ContributionEditingStore: FC<ContributionEditingStoreProps> = (
  props
) => {
  const spectacleMutator = useSpectacleCommand();
  const [isEditing, setIsEditing] = useState(
    props.initialIsEditingState || false
  );

  const [pendingContributions, setPendingContributions] = useState<
    IContribution[]
  >([]);

  const stagePendingContribution = useCallback(
    (
      newId: string,
      newContributionKey: string,
      newValue: string,
      initialValue: string
    ) => {
      const newContribution =
        newValue !== initialValue
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
            contribution.contributionKey,
            contribution.value
          )
        );

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
