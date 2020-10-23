import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { assign, Machine, send, sendParent } from 'xstate';
import { IShapeTrail } from './interfaces/shape-trail';
import {
  IDiffSuggestionPreview,
  initialTitleForNewRegions,
  prepareNewRegionDiffSuggestionPreview,
  prepareShapeDiffSuggestionPreview,
} from '../__tests__/diff-helpers/prepare-diff-previews';
import { InteractiveSessionConfig } from './interfaces/session';
import { IDiffDescription } from './interfaces/interpretors';
import { descriptionForDiffs } from './interpretors/DiffDescriptionInterpretors';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';

interface DiffStateSchema {
  states: {
    unfocused: {};
    loading: {};
    ready: {
      states: {
        unhandled: {};
        handled: {};
      };
    };
  };
}

// The events that the machine handles
type DiffEvent =
  | { type: 'SHOWING' }
  | { type: 'CHANGE_SUGGESTION'; to: string }
  | { type: 'DISMISS_TYPE'; type_slug: string }
  | { type: 'STAGE' }
  | { type: 'UNSTAGE' }
  | { type: 'RESET' };

// The context (extended state) of the machine
interface DiffContext<InterpretationContext> {
  results: InterpretationContext | undefined;
  preview: IDiffSuggestionPreview | undefined;
  descriptionWhileLoading: IDiffDescription;
}

export const createNewRegionMachine = (
  id: string,
  parsedDiff: ParsedDiff,
  services: InteractiveSessionConfig
) =>
  Machine<DiffContext<ILearnedBodies>, DiffStateSchema, DiffEvent>({
    id,
    context: {
      results: undefined,
      preview: undefined,
      descriptionWhileLoading: descriptionForDiffs([parsedDiff]),
    },
    initial: 'unfocused',
    states: {
      unfocused: {
        on: {
          //@ts-ignore
          'done.invoke.loading-initial-regions': {
            actions: assign({
              //@ts-ignore
              results: (context, event) => event.data,
            }),
            target: 'loading',
          },
        },
      },
      loading: {
        invoke: {
          id: 'preparing-preview-of-diff',
          src: async (context, event) => {
            return prepareNewRegionDiffSuggestionPreview(
              parsedDiff,
              services,
              context.results!
            );
          },
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
        states: {
          unhandled: {
            entry: [
              (context, event) => console.log('ready to show the diff. '),
            ],
          },
          handled: {},
        },
      },
    },
  });
//
export const createShapeDiffMachine = (
  shapeTrail: IShapeTrail,
  diffs: ParsedDiff[],
  id: string,
  services: InteractiveSessionConfig
) =>
  Machine<
    DiffContext<IValueAffordanceSerializationWithCounter>,
    DiffStateSchema,
    DiffEvent
  >({
    id: id,
    context: {
      results: undefined,
      descriptionWhileLoading: descriptionForDiffs(diffs),
      preview: undefined,
    },
    initial: 'unfocused',
    states: {
      unfocused: {
        on: { SHOWING: 'loading' },
      },
      loading: {
        invoke: {
          id: 'loading-shape-diff-affordances',
          src: async (context, event) => {
            const firstDiff = diffs[0]!;
            const { pathId, method } = firstDiff.location();

            const trailValues = await services.diffService.learnTrailValues(
              services.rfcBaseState.rfcService,
              services.rfcBaseState.rfcId,
              pathId,
              method,
              firstDiff.raw()
            );

            return {
              preview: await prepareShapeDiffSuggestionPreview(
                diffs,
                services,
                trailValues
              ),
              results: trailValues,
            };
          },
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
        states: {
          unhandled: {
            entry: [(context, event) => console.log('ready to show the diff.')],
          },
          handled: {},
        },
      },
    },
  });
