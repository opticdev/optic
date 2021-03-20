import { assign, Machine } from 'xstate';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { IPendingEndpoint } from './SharedDiffState';

export const newLearnPendingEndpointMachine = (
  pendingEndpoint: IPendingEndpoint,
  onCommandsChanged: (commands: any[]) => void
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
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'learn-endpoint',
          src: async (context, event) => {
            // async work
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return dummyBodyLearners;
          },
          onDone: {
            actions: assign({
              learnedBodies: (ctx, event) => event.data as ILearnedBodies,
            }),
            target: 'ready',
          },
          onError: {
            target: 'error',
          },
        },
      },
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
    loading: {};
    error: {};
    ready: {};
  };
}

// The events that the machine handles
export type PendingEndpointStateEvent =
  | {
      type: 'BODY_LEARNED';
      learnedBodies: ILearnedBodies;
    }
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
  learnedBodies?: ILearnedBodies;
  ignoredBodies: IIgnoreBody[];
}

export type IIgnoreBody = {
  statusCode?: number;
  contentType: string;
  isRequest?: boolean;
  isResponse?: boolean;
};

///////////////////////////////Dummy Data
const dummyBodyLearners: ILearnedBodies = {
  method: '',
  pathId: '',
  requests: [
    {
      contentType: 'application/json',
      commands: [],
      rootShapeId: '',
    },
  ],
  responses: [
    {
      contentType: 'application/json',
      commands: [],
      rootShapeId: '',
      statusCode: 200,
    },
    {
      contentType: 'text/html',
      commands: [],
      statusCode: 400,
      rootShapeId: '',
    },
    {
      contentType: 'application/json',
      rootShapeId: '',
      commands: [],
      statusCode: 404,
    },
    {
      contentType: 'text/html',
      rootShapeId: '',
      commands: [],
      statusCode: 500,
    },
  ],
};
