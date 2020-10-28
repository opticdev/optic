import { assign, spawn, Machine, StateMachine, send } from 'xstate';
import { ParsedDiff } from './parse-diff';
import { DiffSet } from './diff-set';
import { InteractiveSessionConfig } from './interfaces/session';
import {
  InteractiveEndpointSessionEvent,
  newInteractiveEndpointSessionMachine,
} from './interactive-endpoint';

export interface DiffSessionSessionStateSchema {
  states: {
    loading: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
export type DiffSessionSessionEvent =
  | { type: 'COMPLETED_DIFF'; diffs: ParsedDiff[] }
  | { type: 'SHOWING' }
  | {
      type: 'SELECTED_ENDPOINT';
      pathId: string;
      method: string;
    }
  | {
      type: 'SEND_TO_ENDPOINT';
      pathId: string;
      method: string;
      event: InteractiveEndpointSessionEvent;
    };

export function sendMessageToEndpoint(
  pathId: string,
  method: string,
  event: InteractiveEndpointSessionEvent
) {
  return {
    type: 'SEND_TO_ENDPOINT',
    pathId,
    method,
    event,
  };
}

interface IEndpointWithStatus {
  pathId: string;
  method: string;
  handled: boolean;
  diffCount: number;
  machine: any;
  ref?: any;
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
              context.allDiffs,
              services.rfcBaseState
            ).groupedByEndpoint();
            const endpoints: IEndpointWithStatus[] = byEndpoint.map(
              ({ pathId, method, diffs }) => {
                return {
                  pathId,
                  handled: false,
                  diffCount: diffs.length,
                  method,
                  machine: newInteractiveEndpointSessionMachine(
                    pathId,
                    method,
                    diffs,
                    services
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
                endpoints: (context, event) => {
                  return event.data.map((endpoint) => {
                    return {
                      ...endpoint,
                      ref: spawn(
                        endpoint.machine,
                        `${endpoint.pathId}${endpoint.method}`
                      ),
                    };
                  });
                },
              }),
            ],
          },
        },
      },
      ready: {
        on: {
          SEND_TO_ENDPOINT: {
            actions: (context, event) => {
              const actor = context.endpoints.find(
                (i) => i.pathId === event.pathId && i.method === event.method
              );
              if (actor) {
                console.log('sending message');
                actor.ref.send(event.event);
              }
            },
          },
          SELECTED_ENDPOINT: {
            actions: [
              assign({
                focus: (context, event) => ({
                  pathId: event.pathId,
                  method: event.method,
                }),
              }),
              (context) => {
                const endpointMachine = context.endpoints.find(
                  (i) =>
                    i.pathId === context.focus.pathId &&
                    i.method === context.focus.method
                )!.ref;
                send({ type: 'PREPARE' }, { to: endpointMachine }); //warm it up
              },
            ],
          },
        },
      },
    },
  });
};
