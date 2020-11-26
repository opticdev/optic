import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { assign, Machine, send, sendParent } from 'xstate';
import {
  IgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from './interpretors/ignores/ignore-rule';
import {
  IDiffSuggestionPreview,
  IDiffDescription,
} from './interfaces/interpretors';
import { InteractiveSessionConfig } from './interfaces/session';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { descriptionForDiffs } from './interpretors/diff-description-interpretors';
import {
  prepareNewRegionDiffSuggestionPreview,
  prepareShapeDiffSuggestionPreview,
} from './interpretors/prepare-diff-previews';
import { IShapeTrail } from './interfaces/shape-trail';

interface DiffStateSchema {
  states: {
    unfocused: {};
    loading: {};
    ready: {
      states: {
        reload_preview: {};
        unhandled: {};
        handled: {};
      };
    };
  };
}

// The events that the machine handles
type DiffEvent =
  | { type: 'SHOWING' }
  | { type: 'UPDATE_PREVIEW'; ignoreRules: IgnoreRule[] }
  | { type: 'SET_SUGGESTION_INDEX'; index: number }
  | { type: 'DISMISS_TYPE'; type_slug: string }
  | { type: 'STAGE' }
  | { type: 'UNSTAGE' }
  | { type: 'RESET' };

// The context (extended state) of the machine
export interface DiffContext<InterpretationContext> {
  results: InterpretationContext | undefined;
  preview: IDiffSuggestionPreview | undefined;
  relevantIgnoreRules: IgnoreRule[];
  descriptionWhileLoading: IDiffDescription;
  selectedSuggestionIndex: number;
}

// standard interface for diffs
const createNewDiffMachine = <Context>(
  id: string,
  diff: ParsedDiff,
  services: InteractiveSessionConfig,
  createInitialState: (id: string, diff: ParsedDiff) => DiffContext<Context>,
  listenToInitialRegions: boolean,
  listenToLearnedTrails: boolean,
  reloadPreview: (
    id: string,
    diff: ParsedDiff,
    services: InteractiveSessionConfig,
    context: DiffContext<Context>
  ) => Promise<IDiffSuggestionPreview>
) =>
  Machine<DiffContext<Context>, DiffStateSchema, DiffEvent>({
    id: id,
    context: createInitialState(id, diff),
    initial: 'unfocused',
    states: {
      unfocused: {
        on: {
          //@ts-ignore
          'done.invoke.loading-endpoint-context': {
            actions: assign({
              //@ts-ignore
              results: (context, event) => {
                //@ts-ignore
                const { regions, trailValues } = event.data;
                if (listenToInitialRegions) {
                  return regions;
                }
                if (listenToLearnedTrails) {
                  return trailValues[diff.diffHash];
                }
              },
            }),
            target: 'loading',
          },
        },
      },
      loading: {
        invoke: {
          id: 'loading' + id,
          src: async (context, event) =>
            reloadPreview(id, diff, services, context),
          onDone: {
            target: 'ready',
            actions: assign({
              preview: (context, event) => event.data,
            }),
          },
        },
      },
      ready: {
        initial: 'unhandled',
        on: {
          UPDATE_PREVIEW: {
            // actions: [
            cond: (context, event) =>
              event.ignoreRules.filter((i) => i.diffHash === diff.diffHash)
                .length !== context.relevantIgnoreRules.length,
            actions: [
              assign({
                relevantIgnoreRules: (context, event) => {
                  return event.ignoreRules.filter(
                    (i) => i.diffHash === diff.diffHash
                  );
                },
              }),
            ],
            target: 'ready.reload_preview',
          },
          SET_SUGGESTION_INDEX: {
            actions: assign({
              selectedSuggestionIndex: (ctx, event) => event.index,
            }),
          },
        },
        states: {
          reload_preview: {
            invoke: {
              id: 'reloading-preview',
              src: async (context, event) =>
                reloadPreview(id, diff, services, context),
              onDone: {
                target: 'unhandled',
                actions: assign({
                  preview: (context, event) => event.data,
                  selectedSuggestionIndex: () => 0,
                }),
              },
            },
          },
          unhandled: {
            on: {
              STAGE: {
                target: 'handled',
              },
            },
            invoke: {
              id: 'should-switch-to-handled',
              src: async (context, event) => {
                const alreadyHandled =
                  context.preview &&
                  (context.preview.tabs.length === 0 ||
                    context.preview.suggestions.length === 0);
                return alreadyHandled;
              },
              onDone: {
                target: 'handled',
                cond: (c, event) => Boolean(event.data),
              },
            },
          },
          handled: {
            on: {
              UNSTAGE: {
                target: 'unhandled',
              },
              RESET: {
                actions: [assign({ relevantIgnoreRules: (_) => [] })],
                target: 'reload_preview',
              },
            },
          },
        },
      },
    },
  });

export const createNewRegionMachine = (
  id: string,
  parsedDiff: ParsedDiff,
  services: InteractiveSessionConfig
) =>
  createNewDiffMachine<ILearnedBodies>(
    id,
    parsedDiff,
    services,
    (id: string, diff: ParsedDiff) => ({
      results: undefined,
      preview: undefined,
      relevantIgnoreRules: [],
      descriptionWhileLoading: descriptionForDiffs(
        parsedDiff,
        services.rfcBaseState
      ),
      selectedSuggestionIndex: 0,
    }),
    true,
    false,
    async (
      id: string,
      diff: ParsedDiff,
      services: InteractiveSessionConfig,
      context: DiffContext<ILearnedBodies>
    ) => {
      return await prepareNewRegionDiffSuggestionPreview(
        parsedDiff,
        services,
        context.results!,
        context.relevantIgnoreRules
      );
    }
  );

export const createShapeDiffMachine = (
  id: string,
  parsedDiff: ParsedDiff,
  services: InteractiveSessionConfig
) =>
  createNewDiffMachine<IValueAffordanceSerializationWithCounter>(
    id,
    parsedDiff,
    services,
    (id: string, diff: ParsedDiff) => ({
      results: undefined,
      relevantIgnoreRules: [],
      descriptionWhileLoading: descriptionForDiffs(diff, services.rfcBaseState),
      preview: undefined,
      selectedSuggestionIndex: 0,
    }),
    false,
    true,
    async (
      id: string,
      diff: ParsedDiff,
      services: InteractiveSessionConfig,
      context: DiffContext<IValueAffordanceSerializationWithCounter>
    ) => {
      return await prepareShapeDiffSuggestionPreview(
        diff,
        services,
        context.results!,
        context.relevantIgnoreRules
      );
    }
  );
