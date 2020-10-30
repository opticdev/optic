import {
  createShapeDiffMachine,
  DiffContext,
} from '../interactive-diff-machine';
import { InteractiveSessionConfig } from '../interfaces/session';
import { ParsedDiff } from '../parse-diff';
import { useActor } from '@xstate/react';

export function useSingleDiffMachine(
  diff: ParsedDiff,
  getSelf: () => any,
  getEndpointActions: () => any,
  services: InteractiveSessionConfig
) {
  const [state, send] = useActor(getSelf());
  const context: DiffContext<any> = state.context;
  const value: string = state.value;

  function createActions() {
    const endpointActions = getEndpointActions();
    return {
      showing: () => send({ type: 'SHOWING' }),
      setSelectedSuggestionIndex: (index: number) =>
        //@ts-ignore
        send({ type: 'SET_SUGGESTION_INDEX', index }),
      stage: () => {
        send({ type: 'STAGE' });
        endpointActions.handledUpdated();
      },
      unstage: () => {
        send({ type: 'UNSTAGE' });
        endpointActions.handledUpdated();
      },
    };
  }

  function createQueries() {
    return {
      ignoreRules: () => context.revevantIgnoreRules,
      preview: () => context.preview,
      description: () => context.descriptionWhileLoading,
      status: () => value,
      selectedSuggestionIndex: () => context.selectedSuggestionIndex,
    };
  }

  return {
    value,
    context,
    diffActions: createActions(),
    diffQueries: createQueries(),
  };
}
