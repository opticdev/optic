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
import { newInteractiveEndpointSessionMachine } from './interactive-endpoint';

interface DiffSessionSessionStateSchema {
  states: {
    loading: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
type DiffSessionSessionEvent = { type: 'COMPLETED_DIFF'; diffs: ParsedDiff[] };

interface IEndpointWithStatus {
  pathId: string;
  method: string;
  handled: boolean;
  diffCount: number;
  ref: any;
}

// The context (extended state) of the machine
export interface DiffSessionSessionContext {
  allDiffs: ParsedDiff[];
  endpoints: IEndpointWithStatus[];
  focus?: { pathId: string; method: string };
}

export const newDiffSessionSessionMachine = (
  diffId: string,
  services: InteractiveSessionConfig
) => {
  return Machine<
    DiffSessionSessionContext,
    DiffSessionSessionStateSchema,
    DiffSessionSessionEvent
  >({
    id: diffId,
    context: {
      allDiffs: [],
      endpoints: [],
    },
    initial: 'loading',
    states: {
      loading: {
        on: {
          COMPLETED_DIFF: {
            actions: assign({
              allDiffs: (context, event) => event.diffs,
            }),
            target: 'preparing',
          },
        },
      },
      preparing: {
        invoke: {
          id: 'preparing-endpoints',
          src: async (context, event) => {
            const byEndpoint = new DiffSet(
              context.allDiffs
            ).groupedByEndpoint();
            const endpoints: IEndpointWithStatus[] = byEndpoint.map(
              ({ pathId, method, diffs }) => {
                return {
                  pathId,
                  handled: false,
                  diffCount: diffs.length,
                  method,
                  ref: spawn(
                    newInteractiveEndpointSessionMachine(
                      pathId,
                      method,
                      diffs,
                      services
                    ),
                    `${method}.${pathId}`
                  ),
                };
              }
            );
            return endpoints;
          },
          onDone: {
            target: 'ready',
            actions: [
              assign({
                endpoints: (context, event) => event.data,
              }),
            ],
          },
        },
      },
      ready: {},
    },
  });
};
