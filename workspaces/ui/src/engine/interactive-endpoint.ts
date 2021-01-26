import { assign, spawn, Machine, StateMachine, send } from 'xstate';
import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { IShapeTrail } from './interfaces/shape-trail';
import { DiffSet } from './diff-set';
import {
  createNewRegionMachine,
  createShapeDiffMachine,
} from './interactive-diff-machine';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import {
  DiffSessionConfig,
  InteractiveDiffSessionConfig,
} from './interfaces/session';
import { IgnoreRule } from './interpreter/ignores/ignore-rule';
import { IDiff } from './interfaces/diffs';

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
  | { type: 'RESET' }
  | { type: 'APPROVE_FIRST_SUGGESTIONS' };

// The context (extended state) of the machine
export interface InteractiveEndpointSessionContext {
  newRegions: {
    diffParsed: ParsedDiff;
    ref: any;
  }[];
  shapeDiffs: { diffParsed: ParsedDiff; shapeTrail: IShapeTrail; ref: any }[];
  ignored: IgnoreRule[];
  handledByDiffHash: { [key: string]: boolean };
}

export const newInteractiveEndpointSessionMachine = (
  pathId: string,
  method: string,
  diffs: ParsedDiff[],
  services: InteractiveDiffSessionConfig
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
            shapeDiffs: (context, event) => {
              const shapeDiffsGrouped = new DiffSet(
                diffs,
                services.rfcBaseState
              )
                .shapeDiffs()
                .filterToValidExpectations()
                .groupedByEndpointAndShapeTrail();

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
          assign({
            handledByDiffHash: (context) => computeHandled(context),
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
          id: 'loading-endpoint-context',
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

            const diffMap: { [key: string]: IDiff } = {};
            context.shapeDiffs.forEach(
              (i) => (diffMap[i.diffParsed.diffHash] = i.diffParsed.raw())
            );

            let trailValuesWalker: Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> = Promise.resolve(
              {}
            );

            if (context.shapeDiffs.length > 0) {
              trailValuesWalker = services.diffService.learnTrailValues(
                rfcService,
                rfcId,
                pathId,
                method,
                diffMap
              );
            }

            return {
              regions: await newRegionWalker,
              trailValues: await trailValuesWalker,
            };
          },
          onDone: {
            target: 'ready',
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
                console.timeEnd('add ignore');
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
          APPROVE_FIRST_SUGGESTIONS: {
            actions: [
              (ctx) => {
                //send all ignore rules to children. they decide which ones they care about
                const notifyChildren = {
                  type: 'APPROVE_FIRST_SUGGESTION',
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
