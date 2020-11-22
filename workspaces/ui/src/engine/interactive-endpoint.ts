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
import { IgnoreRule } from './interpretors/ignores/ignore-rule';

export interface InteractiveEndpointSessionStateSchema {
  states: {
    unfocused: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
export type InteractiveEndpointSessionEvent =
  | {
      type: 'PREPARE';
    }
  | {
      type: 'ADD_IGNORE';
      newRule: IgnoreRule;
    }
  | {
      type: 'REMOVE_IGNORES';
      diffHash: string;
    }
  | {
      type: 'HANDLED_UPDATED';
    }
  | { type: 'RESET' };

// The context (extended state) of the machine
export interface InteractiveEndpointSessionContext {
  newRegions: {
    diffParsed: ParsedDiff;
    ref: any;
  }[];
  shapeDiffs: { diffParsed: ParsedDiff; shapeTrail: IShapeTrail; ref: any }[];
  ignored: IgnoreRule[];
  handledByDiffHash: { [key: string]: boolean };
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
      handledByDiffHash: {},
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
              const newRegionDiffs = new DiffSet(diffs, services.rfcBaseState)
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
            handledByDiffHash: (context) => computeHandled(context),
            shapeDiffs: (context, event) => {
              const shapeDiffsGrouped = new DiffSet(
                diffs,
                services.rfcBaseState
              ).groupedByEndpointAndShapeTrail();

              return shapeDiffsGrouped.map(
                ({ diffs, shapeDiffGroupingHash, shapeTrail }) => {
                  const id = 'shape-diff' + shapeDiffGroupingHash;
                  return {
                    shapeTrail,
                    diffParsed: diffs[0],
                    ref: spawn(createShapeDiffMachine(id, diffs[0], services), {
                      name: id,
                      autoForward: true,
                    }),
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
            const {
              rfcService,
              rfcId,
              domainIdGenerator,
            } = services.rfcBaseState;

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
                method,
                domainIdGenerator
              );
            }
            return await newRegionWalker;
          },
          onDone: {
            target: 'ready',
            actions: [
              assign({
                learningContext: (context, event) => {
                  return event.data;
                },
              }),
            ],
          },
        },
      },
      ready: {
        on: {
          HANDLED_UPDATED: {
            actions: assign({
              handledByDiffHash: (context) => computeHandled(context),
            }),
          },
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
          RESET: {
            actions: [
              assign({
                ignored: (_, __) => [],
              }),
              (ctx) => {
                //send all ignore rules to children. they decide which ones they care about
                const notifyChildren = {
                  type: 'RESET',
                };
                ctx.shapeDiffs.forEach((i) => i.ref.send(notifyChildren));
                ctx.newRegions.forEach((i) => i.ref.send(notifyChildren));
              },
              assign({
                handledByDiffHash: (context) => computeHandled(context),
              }),
            ],
          },
          REMOVE_IGNORES: {
            actions: [
              assign({
                ignored: (context, event) =>
                  context.ignored.filter((i) => i.diffHash !== event.diffHash),
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

function computeHandled(
  context: InteractiveEndpointSessionContext
): { [key: string]: boolean } {
  const results: { [key: string]: boolean } = {};
  context.shapeDiffs.forEach((i) => {
    const value = i.ref.state.value;
    results[i.diffParsed.diffHash] = value && value.ready === 'handled';
  });
  context.newRegions.forEach((i) => {
    const value = i.ref.state.value;
    results[i.diffParsed.diffHash] = value && value.ready === 'handled';
  });
  return results;
}
