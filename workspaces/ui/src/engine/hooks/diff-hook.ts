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
  services: InteractiveSessionConfig
) {
  const [state, send] = useActor(getSelf());
  const context: DiffContext<any> = state.context;
  const value: string = state.value;

  function createActions() {
    return {
      showing: () => send({ type: 'SHOWING' }),
    };
  }

  function createQueries() {
    return {
      preview: () => context.preview,
      description: () => context.descriptionWhileLoading,
      status: () => value,
    };
  }

  return {
    value,
    context,
    diffActions: createActions(),
    diffQueries: createQueries(),
  };
}
