import * as React from 'react';
import { FC, useCallback, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSpectacleCommand } from '<src>/spectacle-implementations/spectacle-provider';
import { AddContribution } from '<src>/lib/command-factory';
import {
  useDebouncedFn,
  useStateWithSideEffect,
} from '<src>/optic-components/hooks/util';

export const ContributionEditContext = React.createContext({});

type ContributionEditContextValue = {
  isEditing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  commitModalOpen: boolean;
  setCommitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  save: (commitMessage: string) => Promise<void>;
  pendingCount: number;
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
  const debouncedStagePendingContribution = useDebouncedFn(
    stagePendingContribution,
    200
  );

  const { value, setValue } = useStateWithSideEffect({
    initialValue,
    sideEffect: (newValue: string) =>
      debouncedStagePendingContribution(
        id,
        contributionKey,
        newValue,
        initialValue
      ),
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
  const [commitModalOpen, setCommitModalOpen] = useState(false);

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

        try {
          await spectacleMutator({
            query: `
            mutation X(
              $commands: [JSON],
              $batchCommitId: ID,
              $commitMessage: String,
              $clientId: ID,
              $clientSessionId: ID
            ) {
              applyCommands(
                commands: $commands,
                batchCommitId: $batchCommitId,
                commitMessage: $commitMessage,
                clientId: $clientId,
                clientSessionId: $clientSessionId
              ) {
                batchCommitId
              }
            }
            `,
            variables: {
              commands,
              commitMessage,
              batchCommitId: uuidv4(),
              clientId: uuidv4(), //@dev: fill this in
              clientSessionId: uuidv4(), //@dev: fill this in
            },
          });

          setPendingContributions([]);
        } catch (e) {
          console.error(e);
          debugger;
        }
      }
      setIsEditing(false);
    },
    pendingCount: pendingContributions.length,
    setEditing: (bool) => setIsEditing(bool),
    stagePendingContribution,
    commitModalOpen,
    setCommitModalOpen,
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
