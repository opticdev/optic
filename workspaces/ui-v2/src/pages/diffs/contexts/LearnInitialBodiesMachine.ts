import { assign, Machine, sendUpdate } from 'xstate';
import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  ILearnedBodies,
  ILearnedBody,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import {
  AddContribution,
  AddRequest,
  CQRSCommand,
  IOpticDiffService,
} from '@useoptic/spectacle';
import { getEndpointId } from '<src>/utils';
import { newRandomIdGenerator } from '<src>/lib/domain-id-generator';

export const newInitialBodiesMachine = (
  currentSpecContext: CurrentSpecContext,
  pathPattern: string,
  method: string,
  learningPathId: string,
  learningPathCommands: CQRSCommand[],
  diffService: IOpticDiffService
) => {
  return Machine<InitialBodiesContext, InitialBodiesSchema, InitialBodiesEvent>(
    {
      id: 'endpoint-id',
      context: {
        learnedBodies: undefined,
        ignoredBodies: [],
        pathCommands: [],
        allCommands: [],
        pathId: '',
        method,
        stagedEndpointName: '',
      },
      initial: 'loading',
      states: {
        ready: {
          on: {
            STAGED_ENDPOINT_NAME_UPDATED: {
              actions: [
                assign({
                  stagedEndpointName: (ctx, event) => event.name,
                }),
                assign({
                  allCommands: (ctx) =>
                    recomputePendingEndpointCommands(
                      learningPathCommands,
                      learningPathId,
                      ctx
                    ),
                }),
              ],
            },
            USER_IGNORED_BODY: {
              actions: [
                assign({
                  ignoredBodies: (ctx, event) => [
                    ...ctx.ignoredBodies,
                    event.ignored,
                  ],
                }),
                assign({
                  allCommands: (ctx) =>
                    recomputePendingEndpointCommands(
                      learningPathCommands,
                      learningPathId,
                      ctx
                    ),
                }),
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
                assign({
                  allCommands: (ctx) =>
                    recomputePendingEndpointCommands(
                      learningPathCommands,
                      learningPathId,
                      ctx
                    ),
                }),
                (ctx) => ctx.allCommands,
              ],
            },
          },
        },
        loading: {
          invoke: {
            id: 'load-endpoint-bodies',
            src: async (context, event) => {
              const learner = await diffService.learnUndocumentedBodies(
                learningPathId,
                method,
                learningPathCommands
              );

              return {
                learnedBodies: {
                  pathId: learningPathId,
                  method: learner.method,
                  requests: learner.requests,
                  responses: [...learner.responses].sort(
                    (a, b) => (a.statusCode || 0) - (b.statusCode || 0)
                  ),
                },
              };
            },
            onDone: {
              actions: [
                assign({
                  pathId: (ctx, event) => learningPathId,
                  pathCommands: (ctx, event) => learningPathCommands,
                  learnedBodies: (ctx, event) => event.data.learnedBodies,
                }),
                assign({
                  allCommands: (ctx) =>
                    recomputePendingEndpointCommands(
                      learningPathCommands,
                      learningPathId,
                      ctx
                    ),
                }),
                sendUpdate(),
              ],
              target: 'ready',
            },
          },
        },
      },
    }
  );
};

export function recomputePendingEndpointCommands(
  pathCommands: CQRSCommand[],
  pathId: string,
  ctx: InitialBodiesContext
): any[] {
  const commands = [...pathCommands];
  const ids = newRandomIdGenerator();

  function isIgnored(body: ILearnedBody, isRequest: boolean) {
    return Boolean(
      ctx.ignoredBodies.find((i) => {
        return (
          (i.isRequest && isRequest && i.contentType === body.contentType) ||
          (i.isResponse &&
            i.contentType === body.contentType &&
            i.statusCode === body.statusCode)
        );
      })
    );
  }

  if (ctx.learnedBodies) {
    ctx.learnedBodies.requests.forEach((i) => {
      if (!isIgnored(i, true)) {
        commands.push(...i.commands);
      }
    });

    const allRequestBodiesIgnored = ctx.learnedBodies.requests.every((i) =>
      isIgnored(i, true)
    );

    if (
      (allRequestBodiesIgnored && ctx.learnedBodies.responses.length > 0) ||
      ctx.learnedBodies.responses.length === 0
    ) {
      commands.push(AddRequest(ctx.method, pathId, ids.newRequestId()));
    }

    ctx.learnedBodies.responses.forEach((i) => {
      if (!isIgnored(i, false)) {
        commands.push(...i.commands);
      }
    });
  }

  if (ctx.stagedEndpointName) {
    commands.push(
      AddContribution(
        getEndpointId({ method: ctx.method, pathId }),
        'purpose',
        ctx.stagedEndpointName
      )
    );
  }

  return commands.map((i) => {
    //if pathId has changed, update to match
    if ('AddRequest' in i) {
      return { AddRequest: { ...i.AddRequest, pathId } };
    }
    if ('AddResponseByPathAndMethod' in i) {
      return {
        AddResponseByPathAndMethod: { ...i.AddResponseByPathAndMethod, pathId },
      };
    }
    return i;
  });
}

////////////////////////////////Machine Types
export interface InitialBodiesSchema {
  states: {
    loading: {};
    ready: {};
  };
}

// The events that the machine handles
export type InitialBodiesEvent =
  | {
      type: 'USER_IGNORED_BODY';
      ignored: IIgnoreBody;
    }
  | {
      type: 'USER_INCLUDED_BODY';
      removeIgnore: IIgnoreBody;
    }
  | {
      type: 'STAGED_ENDPOINT_NAME_UPDATED';
      name: string;
    };

// The context (extended state) of the machine
export interface InitialBodiesContext {
  learnedBodies: ILearnedBodies | undefined;
  ignoredBodies: IIgnoreBody[];
  pathCommands: any[];
  allCommands: any[];
  pathId: string;
  method: string;
  stagedEndpointName: string;
}

export type IIgnoreBody = {
  statusCode?: number;
  contentType: string;
  isRequest?: boolean;
  isResponse?: boolean;
};
