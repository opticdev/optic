import { assign, Machine } from 'xstate';
import { CurrentSpecContext } from '../../../lib/Interfaces';
import {
  ILearnedBodies,
  ILearnedBody,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { localInitialBodyLearner } from '../../../lib/__scala_kill_me/browser-initial-body-dep';
import {
  AddContribution,
  AddPathComponent,
  AddPathParameter,
} from '../../../lib/command-factory';
import { getEndpointId } from '../../utilities/endpoint-utilities';

export const newInitialBodiesMachine = (
  currentSpecContext: CurrentSpecContext,
  pathPattern: string,
  method: string,
  onCommandsChanged: (commands: any[]) => void,
  allSamples: any[],
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
                  allCommands: (ctx) => recomputeCommands(ctx),
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
                  allCommands: (ctx) => recomputeCommands(ctx),
                }),
                (ctx) => onCommandsChanged(ctx.allCommands),
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
                  allCommands: (ctx) => recomputeCommands(ctx),
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
              const { commands, pathId } = pathToCommands(
                pathPattern,
                currentSpecContext,
              );

              const learner = await localInitialBodyLearner(
                //@ts-ignore
                window.events!,
                commands,
                pathId,
                method,
                allSamples,
              );

              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve({
                    learnedBodies: learner as ILearnedBodies,
                    pathCommands: commands,
                    pathId,
                  });
                }, 1500);
              });
            },
            onDone: {
              actions: [
                assign({
                  learnedBodies: (ctx, event) => event.data.learnedBodies,
                  pathCommands: (ctx, event) => event.data.pathCommands,
                  pathId: (ctx, event) => event.data.pathId,
                }),
                assign({
                  allCommands: (ctx) => recomputeCommands(ctx),
                }),
              ],
              target: 'ready',
            },
          },
        },
      },
    },
  );
};

export function recomputeCommands(ctx: InitialBodiesContext): any[] {
  const commands = [...ctx.pathCommands];

  function isIgnored(body: ILearnedBody, isRequest: boolean) {
    return Boolean(
      ctx.ignoredBodies.find((i) => {
        return (
          (i.isRequest && isRequest && i.contentType === body.contentType) ||
          (i.isResponse &&
            i.contentType === body.contentType &&
            i.statusCode === body.statusCode)
        );
      }),
    );
  }

  if (ctx.learnedBodies) {
    ctx.learnedBodies.requests.forEach((i) => {
      if (!isIgnored(i, true)) {
        commands.push(...i.commands);
      }
    });
    ctx.learnedBodies.responses.forEach((i) => {
      if (!isIgnored(i, false)) {
        commands.push(...i.commands);
      }
    });
  }

  if (ctx.stagedEndpointName) {
    commands.push(
      AddContribution(
        getEndpointId({ method: ctx.method, pathId: ctx.pathId }),
        'PURPOSE',
        ctx.stagedEndpointName,
      ),
    );
    debugger;
  }

  return commands;
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

function pathToCommands(
  pathPattern: string,
  currentSpecContext: CurrentSpecContext,
): { pathId: string; commands: any[] } {
  const components = pathStringToPathComponents(pathPattern);

  let parentPathId = 'root';
  let lastId = parentPathId;
  const commands = components.map((i) => {
    lastId = currentSpecContext.domainIds.newPathId();
    const thisParentId = parentPathId;
    parentPathId = lastId;
    if (i.isParameter) {
      return AddPathParameter(
        lastId,
        thisParentId,
        cleanupPathComponentName(i.name),
      );
    } else {
      return AddPathComponent(
        lastId,
        thisParentId,
        cleanupPathComponentName(i.name),
      );
    }
  });

  return { pathId: lastId, commands };
}
export function pathStringToPathComponents(
  pathString: string,
): { name: string; isParameter: boolean }[] {
  const components = pathString.split('/').map((name) => {
    const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
    return { name, isParameter };
  });
  const [root, ...rest] = components;
  if (root.name === '') {
    return trimTrailingEmptyPath(rest);
  }
  return trimTrailingEmptyPath(components);
}

function cleanupPathComponentName(name: string) {
  return name.replace(/[{}:]/gi, '');
}

export function trimTrailingEmptyPath(components: any) {
  if (components.length > 0) {
    if (components[components.length - 1].name === '') {
      return components.slice(0, -1);
    }
  }
  return components;
}
