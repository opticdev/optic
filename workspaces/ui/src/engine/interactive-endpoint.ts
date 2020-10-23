import { assign, spawn, Machine, StateMachine, send } from 'xstate';
import { ICaptureService, IDiffService } from '../services/diff';
import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import { IShapeTrail } from './interfaces/shape-trail';
import { DiffSet } from './diff-set';
import { createNewAsyncMachine } from './async-work/async-work-machines';
import {
  createNewRegionMachine,
  createShapeDiffMachine,
} from './interactive-diff-machine';
import { DiffRfcBaseState } from './interfaces/diff-rfc-base-state';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { InteractiveSessionConfig } from './interfaces/session';

interface InteractiveEndpointSessionStateSchema {
  states: {
    unfocused: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
type InteractiveEndpointSessionEvent = {
  type: 'PREPARE';
};

// The context (extended state) of the machine
export interface InteractiveEndpointSessionContext {
  newRegions: {
    diffParsed: ParsedDiff;
    ref: any;
  }[];
  shapeDiffs: { shapeTrail: IShapeTrail; ref: any }[];
  ignored: [];
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
                ({ diffs, shapeTrailHash, shapeTrail }) => {
                  const id = 'shape-diff' + shapeTrailHash;
                  return {
                    shapeTrail,
                    ref: spawn(
                      createShapeDiffMachine(shapeTrail, diffs, id, services),
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
      ready: {},
    },
  });
};
