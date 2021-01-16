import {
  createShapeDiffMachine,
  DiffContext,
} from '../interactive-diff-machine';
import {
  DiffSessionConfig,
  InteractiveDiffSessionConfig,
} from '../interfaces/session';
import { ParsedDiff } from '../parse-diff';
import { useActor } from '@xstate/react';
import { useEffect } from 'react';
import niceTry from 'nice-try';
import { useAnalyticsHook } from '../../utilities/useAnalyticsHook';

export function useSingleDiffMachine(
  diff: ParsedDiff,
  getSelf: () => any,
  getEndpointActions: () => any,
  services: InteractiveDiffSessionConfig
) {
  const [state, send]: any = useActor(getSelf());
  const context: any = state.context;
  const value = state.value;
  const track = useAnalyticsHook();

  const endpointActions = getEndpointActions();

  useEffect(() => {
    endpointActions.handledUpdated();
  }, [value && value.ready]);

  function createActions() {
    return {
      showing: () => send({ type: 'SHOWING' }),
      setSelectedSuggestionIndex: (index: number) =>
        //@ts-ignore
        send({ type: 'SET_SUGGESTION_INDEX', index }),
      stage: () => {
        send({ type: 'STAGE' });
        niceTry(() => {
          track('ACCEPTED_SUGGESTION', {
            description: context.preview.diffDescription.title.map(i => i.text).join(' '),
            suggestion: context.preview.suggestions[context.selectedSuggestionIndex]
                .action.activeTense.map(i => i.text).join(' ')
          });
        });
      },
      unstage: () => {
        send({ type: 'UNSTAGE' });
      },
      reset: () => {
        endpointActions.resetIgnores(diff.diffHash);
      },
    };
  }

  function createQueries() {
    return {
      ignoreRules: () => context.relevantIgnoreRules,
      preview: () => context.preview,
      description: () => context.descriptionWhileLoading,
      status: () => value,
      ignoredAll: () =>
        context.preview &&
        (context.preview.suggestions.length === 0 ||
          context.preview.tabs.length === 0),
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
