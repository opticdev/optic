import { assign, Machine } from 'xstate';
import { IPendingEndpoint } from './SharedDiffState';

export const newLearnPendingEndpointMachine = (
  pendingEndpoint: IPendingEndpoint,
  onCommandsChanged: (commands: any[]) => void,
) => {
  return Machine<
    PendingEndpointStateContext,
    PendingEndpointStateSchema,
    PendingEndpointStateEvent
  >({
    id: pendingEndpoint.id,
    context: {
      ignoredBodies: [],
    },
    initial: 'ready',
    states: {
      ready: {
        on: {
          USER_IGNORED_BODY: {
            actions: [
              assign({
                ignoredBodies: (ctx, event) => [
                  ...ctx.ignoredBodies,
                  event.ignored,
                ],
              }),
              (ctx) => onCommandsChanged(recomputeCommands(ctx)),
            ],
          },
          USER_INCLUDED_BODY: {
            actions: [
              assign({
                ignoredBodies: (ctx, event) => [
                  ...ctx.ignoredBodies.filter((i) => {
                    return !(
                      event.removeIgnore.isRequest === i.isRequest &&
                      event.removeIgnore.isResponse === i.isResponse &&
                      event.removeIgnore.statusCode === i.statusCode &&
                      event.removeIgnore.contentType === i.contentType
                    );
                  }),
                ],
              }),
              (ctx) => onCommandsChanged(recomputeCommands(ctx)),
            ],
          },
        },
      },
      error: {},
    },
  });
};

export function recomputeCommands(ctx: PendingEndpointStateContext): any[] {
  return [];
}

////////////////////////////////Machine Types
export interface PendingEndpointStateSchema {
  states: {
    error: {};
    ready: {};
  };
}

// The events that the machine handles
export type PendingEndpointStateEvent =
  | {
      type: 'USER_IGNORED_BODY';
      ignored: IIgnoreBody;
    }
  | {
      type: 'USER_INCLUDED_BODY';
      removeIgnore: IIgnoreBody;
    };

// The context (extended state) of the machine
export interface PendingEndpointStateContext {
  ignoredBodies: IIgnoreBody[];
}

export type IIgnoreBody = {
  statusCode?: number;
  contentType: string;
  isRequest?: boolean;
  isResponse?: boolean;
};
