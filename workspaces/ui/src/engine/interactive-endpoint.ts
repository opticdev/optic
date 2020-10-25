import { assign, spawn, Machine, StateMachine, send } from 'xstate';
import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { IShapeTrail } from './interfaces/shape-trail';
import { DiffSet } from './diff-set';
import {
  createNewRegionMachine,
  createShapeDiffMachine,
} from './interactive-diff-machine';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { InteractiveSessionConfig } from './interfaces/session';
import { IIgnoreRule } from './interpretors/ignores/IIgnoreRule';

interface InteractiveEndpointSessionStateSchema {
  states: {
    unfocused: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
type InteractiveEndpointSessionEvent =
  | {
      type: 'PREPARE';
    }
  | {
      type: 'ADD_IGNORE';
      newRule: IIgnoreRule;
    };

// The context (extended state) of the machine
export interface InteractiveEndpointSessionContext {
  newRegions: {
    diffParsed: ParsedDiff;
    ref: any;
  }[];
  shapeDiffs: { shapeTrail: IShapeTrail; ref: any }[];
  ignored: IIgnoreRule[];
  learningContext:
    | {
        newRegions: string;
      }
    | undefined;
}

export const newInteractiveEndpointSessionMachine = (
  pathId: string,
  method: string,
  diffs: ParsedDiff[],
  services: InteractiveSessionConfig
) => {
  return Machine<
    InteractiveEndpointSessionContext,
    InteractiveEndpointSessionStateSchema,
    InteractiveEndpointSessionEvent
  >({
    id: `${pathId}.${method}`,
    context: {
      newRegions: [],
      shapeDiffs: [],
      ignored: [],
      learningContext: undefined,
    },
    initial: 'unfocused',
    states: {
      unfocused: {
        entry: [
          assign({
            newRegions: (context, event) => {
              const newRegionDiffs = new DiffSet(diffs)
                .newRegions()
                .iterator()
                .map((diffParsed, index) => {
                  const id = 'region-diff' + index;
                  return {
                    diffParsed,
                    ref: spawn(
                      createNewRegionMachine(id, diffParsed, services),
                      { name: id, autoForward: true }
                    ),
                    id,
                  };
                });
              return newRegionDiffs;
            },
            shapeDiffs: (context, event) => {
              const shapeDiffsGrouped = new DiffSet(
                diffs
              ).groupedByEndpointAndShapeTrail();

              return shapeDiffsGrouped.map(
                ({ diffs, shapeDiffGroupingHash, shapeTrail }) => {
                  const id = 'shape-diff' + shapeDiffGroupingHash;
                  return {
                    shapeTrail,
                    ref: spawn(
                      createShapeDiffMachine(id, diffs[0], services),
                      id
                    ),
                  };
                }
              );
            },
          }),
        ],
        on: {
          PREPARE: {
            target: 'preparing',
          },
        },
      },
      preparing: {
        invoke: {
          id: 'loading-initial-regions',
          src: async (context, event) => {
            const { rfcService, rfcId } = services.rfcBaseState;

            const learnedBodies = await services.diffService.learnInitial(
              rfcService,
              rfcId,
              pathId,
              method
            );

            let newRegionWalker: Promise<ILearnedBodies> = Promise.resolve({
              pathId,
              method,
              requests: [],
              responses: [],
            });

            if (context.newRegions.length > 0) {
              newRegionWalker = services.diffService.learnInitial(
                rfcService,
                rfcId,
                pathId,
                method
              );
            }
            return {
              newRegions: await newRegionWalker,
            };
          },
          onDone: {
            target: 'ready',
            actions: [
              assign({
                learningContext: (context, event) => event.data,
              }),
            ],
          },
        },
      },
      ready: {
        on: {
          ADD_IGNORE: {
            actions: [
              assign({
                ignored: (context, event) => [
                  ...context.ignored,
                  event.newRule,
                ],
              }),
              (ctx) => {
                //send all ignore rules to children. they decide which ones they care about
                const notifyChildren = {
                  type: 'UPDATE_PREVIEW',
                  ignoreRules: ctx.ignored,
                };
                ctx.shapeDiffs.forEach((i) => i.ref.send(notifyChildren));
                ctx.newRegions.forEach((i) => i.ref.send(notifyChildren));
              },
            ],
          },
        },
      },
    },
  });
};
