import * as React from 'react';
import { FC, useCallback, useContext, useState } from 'react';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { AddContribution } from '../../../lib/command-factory';
import { useStateWithSideEffect } from '../util';

export const ContributionEditContext = React.createContext({});

type ContributionEditContextValue = {
  isEditing: boolean;
  save: (commitMessage: string) => void;
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

  const { value, setValue } = useStateWithSideEffect({
    initialValue,
    sideEffect: (newValue: string) =>
      stagePendingContribution(id, contributionKey, newValue, initialValue),
  });

  return {
    value,
    setValue,
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
    save: async (commitMessage: string) => {
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
          mutation X($commands: [JSON], $commitMessage: String) {
            applyCommands(commands: $commands, commitMessage: $commitMessage) {
              batchCommitId
            }
          }
          `,
          variables: {
            commands,
            commitMessage,
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
