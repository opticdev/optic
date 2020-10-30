import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { assign, Machine, send, sendParent } from 'xstate';
import {
  IIgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from './interpretors/ignores/IIgnoreRule';
import {
  IDiffSuggestionPreview,
  IDiffDescription,
} from './interfaces/interpretors';
import { InteractiveSessionConfig } from './interfaces/session';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { descriptionForDiffs } from './interpretors/DiffDescriptionInterpretors';
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
  | { type: 'UPDATE_PREVIEW'; ignoreRules: IIgnoreRule[] }
  | { type: 'SET_SUGGESTION_INDEX'; index: number }
  | { type: 'DISMISS_TYPE'; type_slug: string }
  | { type: 'STAGE' }
  | { type: 'UNSTAGE' }
  | { type: 'RESET' };

// The context (extended state) of the machine
export interface DiffContext<InterpretationContext> {
  results: InterpretationContext | undefined;
  preview: IDiffSuggestionPreview | undefined;
  revevantIgnoreRules: IIgnoreRule[];
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
  loadContext: (
    id: string,
    diff: ParsedDiff,
    services: InteractiveSessionConfig,
    context: DiffContext<Context>
  ) => Promise<{ preview: IDiffSuggestionPreview; results: Context }>,
  realodPreview: (
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
          SHOWING: {
            cond: () => !listenToInitialRegions,
            target: 'loading',
          },
          //@ts-ignore
          'done.invoke.loading-initial-regions': listenToInitialRegions
            ? {
                actions: assign({
                  //@ts-ignore
                  results: (context, event) => event.data,
                }),
                target: 'loading',
              }
            : {},
        },
      },
      loading: {
        invoke: {
          id: 'loading' + id,
          src: async (context, event) =>
            await loadContext(id, diff, services, context),
          onDone: {
            target: 'ready',
            actions: assign({
              results: (context, event) => event.data.results, // cached in case we need to run 'em again
              preview: (context, event) => event.data.preview,
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
                .length !== context.revevantIgnoreRules.length,
            actions: [
              assign({
                revevantIgnoreRules: (context, event) => {
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
                await realodPreview(id, diff, services, context),
              onDone: {
                target: 'unhandled',
                actions: assign({
                  preview: (context, event) => event.data,
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
      revevantIgnoreRules: [],
      descriptionWhileLoading: descriptionForDiffs(
        parsedDiff,
        services.rfcBaseState
      ),
      selectedSuggestionIndex: 0,
    }),
    true,
    async (
      id: string,
      diff: ParsedDiff,
      services: InteractiveSessionConfig,
      context: DiffContext<ILearnedBodies>
    ) => {
      const preview = await prepareNewRegionDiffSuggestionPreview(
        parsedDiff,
        services,
        context.results!
      );
      return { preview, results: context.results! };
    },
    async (
      id: string,
      diff: ParsedDiff,
      services: InteractiveSessionConfig,
      context: DiffContext<ILearnedBodies>
    ) => {
      return await prepareNewRegionDiffSuggestionPreview(
        parsedDiff,
        services,
        context.results!
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
      revevantIgnoreRules: [],
      descriptionWhileLoading: descriptionForDiffs(diff, services.rfcBaseState),
      preview: undefined,
      selectedSuggestionIndex: 0,
    }),
    false,
    async (
      id: string,
      diff: ParsedDiff,
      services: InteractiveSessionConfig,
      context: DiffContext<IValueAffordanceSerializationWithCounter>
    ) => {
      const { pathId, method } = diff.location(services.rfcBaseState);

      const trailValues = await services.diffService.learnTrailValues(
        services.rfcBaseState.rfcService,
        services.rfcBaseState.rfcId,
        pathId,
        method,
        diff.raw()
      );

      return {
        preview: await prepareShapeDiffSuggestionPreview(
          diff,
          services,
          trailValues,
          context.revevantIgnoreRules
        ),
        results: trailValues,
      };
    },
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
        context.revevantIgnoreRules
      );
    }
  );
