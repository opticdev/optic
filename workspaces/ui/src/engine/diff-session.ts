import { assign, spawn, Machine, StateMachine, send } from 'xstate';
import { ParsedDiff } from './parse-diff';
import { DiffSet } from './diff-set';
import { InteractiveSessionConfig } from './interfaces/session';
import {
  InteractiveEndpointSessionContext,
  InteractiveEndpointSessionEvent,
  newInteractiveEndpointSessionMachine,
} from './interactive-endpoint';
import { IUnrecognizedUrl } from '../services/diff';
import { IToDocument } from './interfaces/interfaces';

export interface DiffSessionSessionStateSchema {
  states: {
    loading: {};
    preparing: {};
    ready: {};
  };
}

// The events that the machine handles
export type DiffSessionSessionEvent =
  | { type: 'COMPLETED_DIFF'; diffs: ParsedDiff[]; urls: IUnrecognizedUrl[] }
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
    }
  | { type: 'HANDLED_UPDATED'; pathId: string; method: string }
  | {
      type: 'TOGGLED_UNDOCUMENTED';
      active: boolean;
    }
  | {
      type: 'UPDATED_TO_DOCUMENT';
      handled: number;
      toDocument: IToDocument[];
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

export interface IEndpointWithStatus {
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
  unrecognizedUrls: IUnrecognizedUrl[];
  endpoints: IEndpointWithStatus[];
  handledByEndpoint: IHandledByEndpoint;
  focus?: { pathId: string; method: string };
  showingUndocumented: boolean;
  unrecognizedUrlsToDocument: {
    urls: IToDocument[];
    handled: number;
  };
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
      handledByEndpoint: [],
      unrecognizedUrls: [],
      allDiffs: [],
      endpoints: [],
      unrecognizedUrlsToDocument: {
        handled: 0,
        urls: [],
      },
      showingUndocumented: false,
    },
    initial: 'loading',
    states: {
      loading: {
        on: {
          COMPLETED_DIFF: {
            actions: assign({
              allDiffs: (context, event) => event.diffs,
              unrecognizedUrls: (context, event) => event.urls,
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
          HANDLED_UPDATED: {
            actions: [
              assign({
                handledByEndpoint: (context) => computeHandled(context),
              }),
            ],
          },
          SEND_TO_ENDPOINT: {
            actions: (context, event) => {
              const actor = context.endpoints.find(
                (i) => i.pathId === event.pathId && i.method === event.method
              );
              if (actor) {
                actor.ref.send(event.event);
              }
            },
          },
          TOGGLED_UNDOCUMENTED: {
            actions: assign({
              showingUndocumented: (context, event) => event.active,
              focus: (ctx, event) => undefined,
            }),
          },
          UPDATED_TO_DOCUMENT: {
            actions: assign({
              unrecognizedUrlsToDocument: (context, event) => ({
                urls: event.toDocument,
                handled: event.handled,
              }),
            }),
          },
          SELECTED_ENDPOINT: {
            actions: [
              assign({
                focus: (context, event) => ({
                  pathId: event.pathId,
                  method: event.method,
                }),
                showingUndocumented: (ctx, event) => false,
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

type IHandledByEndpoint = {
  pathId: string;
  method: string;
  diffCount: number;
  handled: number;
}[];
function computeHandled(
  context: DiffSessionSessionContext
): IHandledByEndpoint {
  const results: IHandledByEndpoint = [];

  context.endpoints.forEach((i) => {
    const endpointContext: InteractiveEndpointSessionContext =
      i.ref.state.context;
    const entries: [string, boolean][] = Object.entries(
      endpointContext.handledByDiffHash
    );
    const handled = entries.filter(([key, bool]) => bool).length;
    results.push({
      pathId: i.pathId,
      method: i.method,
      handled,
      diffCount: entries.length !== 0 ? entries.length : i.diffCount,
    });
  });

  return results;
}

export function nextEndpointToFocusOn(
  context: DiffSessionSessionContext,
  endpointsWithDiffs: { pathId: string; method: string }[]
) {
  const indexOfCurrentFoucs: number =
    context.focus &&
    endpointsWithDiffs.findIndex(
      ({ pathId, method }) =>
        pathId === context.focus.pathId && method === context.focus.method
    );

  function alreadyHandled(pathId: string, method: string) {
    const status = context.handledByEndpoint.find(
      (i) => pathId === i.pathId && method === i.method
    );
    return (
      status && status.diffCount > 0 && status.diffCount === status.handled
    );
  }
  // next unhandled after this one, or start from top of list.
  const searchOrder = [
    ...endpointsWithDiffs.slice(
      indexOfCurrentFoucs || 0,
      endpointsWithDiffs.length
    ),
    ...endpointsWithDiffs.slice(0, indexOfCurrentFoucs || 0),
  ].filter(
    (i) =>
      !(
        i.method === context.focus.method && i.pathId === context.focus.pathId
      ) && !alreadyHandled(i.pathId, i.method)
  );

  const next = searchOrder[0];

  return next ? { pathId: next.pathId, method: next.method } : context.focus;
}
