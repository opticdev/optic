import { assign, Machine, send } from 'xstate';

export interface AsyncWorkStateSchema {
  states: {
    unstarted: {};
    started: {};
    completed: {};
    error: {};
  };
}

// The events that the machine handles
export type AsyncWorkEvent = { type: 'ASK_FOR_RESULT'; consumerId: string };

// The context (extended state) of the machine
export interface AsyncWorkContext<R> {
  consumers: Set<string>;
  result: R | undefined;
}

export function createNewAsyncMachine<R>(
  machineId: string,
  job: () => Promise<R>
) {
  return Machine<AsyncWorkContext<R>, AsyncWorkStateSchema, AsyncWorkEvent>({
    id: machineId,
    context: {
      result: undefined,
      consumers: new Set(),
    },
    initial: 'unstarted',
    states: {
      unstarted: {
        on: {
          ASK_FOR_RESULT: {
            target: 'started',
            actions: assign({
              consumers: (context, event) =>
                context.consumers.add(event.consumerId),
            }),
          },
        },
      },
      started: {
        on: {
          ASK_FOR_RESULT: {
            actions: assign({
              consumers: (context, event) =>
                context.consumers.add(event.consumerId),
            }),
          },
        },
        invoke: {
          src: async (context, event) => await job(),
          onDone: {
            actions: [
              assign({
                result: (context, event) => {
                  console.log(event.data);
                  return event.data;
                },
              }),
            ],
            target: 'completed',
          },
          onError: {
            target: 'error',
          },
        },
      },
      completed: {
        on: {
          ASK_FOR_RESULT: {
            actions: (context, event) => {
              send(
                {
                  type: 'INTERPRETATION_CONTEXT',
                  id: machineId,
                  result: context.result,
                },
                {
                  to: event.consumerId,
                }
              );
            },
          },
        },
        invoke: {
          id: 'send-responses',
          src: (context, event) => {
            context.consumers.forEach((consumerId) => {
              const payload = {
                type: 'INTERPRETATION_CONTEXT',
                id: machineId,
                result: context.result,
              };
              send(payload, { to: consumerId });
            });
            return Promise.resolve();
          },
          onDone: {},
          onError: {},
        },
      },
      error: {},
    },
  });
}
