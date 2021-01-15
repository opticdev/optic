import { DiffSessionConfig } from '../interfaces/session';
import { assign, Machine } from 'xstate';
import { IAllChanges } from '../hooks/session-hook';
import { spawn, Thread, Worker } from 'threads';
import {
  commandToJs,
  opticEngine,
  OpticIds,
  RequestsCommands,
} from '@useoptic/domain';
import uuidv4 from 'uuid/v4';
import { resolvePath } from '../../components/utilities/PathUtilities';
import { batchCommandHandler } from '../../components/utilities/BatchCommandHandler';
import flattenDeep from 'lodash.flattendeep';
import Bottleneck from 'bottleneck';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { IOasStats } from './oas-preview-machine';
import { serializeCommands } from '../interpreter/spec-change-dsl';
import { IDiffService } from '../../services/diff';

export interface ApplyChangesStateSchema {
  states: {
    staged: {};
    generatingNewPaths: {};
    generatingNewBodyCommands: {};
    collectingApprovedSuggestions: {};
    runningCommands: {};
    completed: {};
    // completedWithSummary: {};
    failed: {};
  };
}

// The events that the machine handles
export type ApplyChangesEvent =
  | { type: 'START' }
  | { type: 'UPDATE_COMMIT_MESSAGE'; message: string }
  | { type: 'INCREMENT_BODIES_PROGRESS'; methodAndPath: string };

export interface ApplyChangesContext {
  commitMessage: string;
  newPaths: {
    commands: any[];
    commandsJS: any[];
    endpointIds: { pathId: string; method: string; pathExpression: string }[];
  };
  newBodiesProgress: number;
  newBodiesProgressLastLearned: string;
  newBodiesLearned: ILearnedBodies[] | undefined;
  approvedSuggestionsCommands: any[];
  updatedEvents: any[];
  oasStats: IOasStats | undefined;
  error: string;
}

// The context (extended state) of the machine
export interface ApplyChangesContext {}

export const newApplyChangesMachine = (
  patch: IAllChanges,
  services: DiffSessionConfig,
  diffService: IDiffService,
  clientSessionId: string = 'default',
  clientId: string = 'default',
  track: (event: string, props: any) => void = (event: string, props: any) => {}
) => {
  return Machine<
    ApplyChangesContext,
    ApplyChangesStateSchema,
    ApplyChangesEvent
  >({
    id: 'apply-changes',
    context: {
      commitMessage: '',
      newPaths: { commands: [], commandsJS: [], endpointIds: [] },
      newBodiesProgress: 0,
      newBodiesProgressLastLearned: '',
      newBodiesLearned: undefined,
      approvedSuggestionsCommands: [],
      updatedEvents: [],
      oasStats: undefined,
      error: '',
    },
    initial: 'staged',
    states: {
      staged: {
        on: {
          UPDATE_COMMIT_MESSAGE: {
            actions: assign({
              commitMessage: (_, event) => event.message,
            }),
          },
          START: {
            target: 'generatingNewPaths',
          },
        },
      },
      generatingNewPaths: {
        invoke: {
          id: 'path-adding',
          src: async (context, event) => {
            if (patch.added.length) {
              const { commands, commandsJS, endpointIds } = LearnPaths(
                services.rfcBaseState.eventStore,
                services.rfcBaseState.rfcId,
                patch.added
              );
              return { commands, commandsJS, endpointIds };
            }
            return { commands: [], commandsJS: [], endpointIds: [] };
          },
          onDone: {
            target: 'generatingNewBodyCommands',
            actions: assign({
              newPaths: (context, event) => event.data,
            }),
          },
          onError: {
            actions: [
              (context, event) => {
                console.error(event);
              },
              assign({
                error: (ctx, event) => event.data.message,
              }),
            ],
            target: 'failed',
          },
        },
      },
      generatingNewBodyCommands: {
        invoke: {
          id: 'body-generating',
          src: (context, event) => async (callback, onReceive) => {
            const timeStated = Date.now();

            const { endpointIds, commands } = context.newPaths;

            const mergedEndpointIds = [
              ...endpointIds,
              ...patch.endpointsToDocument,
            ];

            if (mergedEndpointIds.length === 0) {
              // exit if no new endpoints
              return [];
            }

            const batchHandler = batchCommandHandler(
              services.rfcBaseState.eventStore,
              services.rfcBaseState.rfcId
            );

            //update with the path commands
            batchHandler.doWork(({ emitCommands }) => emitCommands(commands));

            const throttler = new Bottleneck({
              maxConcurrent: 5,
              minTime: 100,
            });

            const results = mergedEndpointIds.map(
              async ({ pathId, method, pathExpression }, index) => {
                return await throttler.schedule(async () => {
                  console.log(`learning started for ${pathId} ${method}`);
                  let promise;
                  batchHandler.doWork(async ({ rfcService, rfcId }) => {
                    promise = diffService.learnInitial(
                      rfcService,
                      rfcId,
                      pathId,
                      method,
                      services.rfcBaseState.domainIdGenerator
                    );
                  });

                  promise.finally(() => {
                    console.log(`learning finished ${pathId} ${method}`);
                    callback({
                      type: 'INCREMENT_BODIES_PROGRESS',
                      methodAndPath: `${method.toUpperCase()} ${pathExpression}`,
                    });
                  });

                  return await promise.catch(() => null);
                });
              }
            );

            const allBodies: ILearnedBodies[] = (
              await Promise.all(results)
            ).filter((i) => Boolean(i));

            track('LEARNED_BODIES', {
              endpoints: endpointIds,
              elapsedTime: Date.now() - timeStated,
            });

            return allBodies;
          },
          onDone: {
            target: 'collectingApprovedSuggestions',
            actions: assign({
              newBodiesLearned: (context, event) => event.data,
            }),
          },
          onError: {
            actions: [
              (context, event) => {
                console.error(event);
              },
              assign({
                error: (ctx, event) => event.data.message,
              }),
            ],
            target: 'failed',
          },
        },
        on: {
          INCREMENT_BODIES_PROGRESS: {
            actions: assign({
              newBodiesProgress: (context, _) => context.newBodiesProgress + 1,
              newBodiesProgressLastLearned: (context, event) =>
                event.methodAndPath,
            }),
          },
        },
      },
      collectingApprovedSuggestions: {
        invoke: {
          id: 'collecting-commands-from-suggestions',
          src: async (context, event) => {
            const changes = patch.changes;
            const allCommands = [];
            changes.forEach((change) => {
              change.status.forEach((i) => {
                if (i.isHandled && !i.ignored) {
                  allCommands.push(...i.approvedSuggestion.commands);
                }
              });
            });
            return Promise.resolve(allCommands);
          },
          onDone: {
            target: 'runningCommands',
            actions: assign({
              approvedSuggestionsCommands: (context, event) => {
                return event.data;
              },
            }),
          },
          onError: {
            actions: [
              (context, event) => {
                console.error(event);
              },
              assign({
                error: (ctx, event) => event.data.message,
              }),
            ],
            target: 'failed',
          },
        },
      },
      runningCommands: {
        invoke: {
          id: 'running-commands',
          src: async (context, event) => {
            const timeStated = Date.now();
            const allCommandsToRun = [
              ...context.newPaths.commandsJS,
              ...prepareLearnedBodies(context.newBodiesLearned || []),
              ...context.approvedSuggestionsCommands,
            ];

            const worker = await spawn(
              new Worker('./handle-commands-worker.ts')
            );

            const result = await worker.handleCommands(
              allCommandsToRun,
              services.rfcBaseState.eventStore.serializeEvents(
                services.rfcBaseState.rfcId
              ),
              uuidv4(),
              clientSessionId,
              clientId,
              context.commitMessage || ''
            );

            await Thread.terminate(worker);

            track('RUNNING_NEW_COMMANDS', {
              commands: allCommandsToRun.length,
              elapsedTime: Date.now() - timeStated,
            });

            return result;
          },
          onDone: {
            target: 'completed',
            actions: assign({
              updatedEvents: (context, event) => event.data,
            }),
          },
          onError: {
            actions: [
              (context, event) => {
                console.error(event);
              },
              assign({
                error: (ctx, event) => event.data.message,
              }),
            ],
            target: 'failed',
          },
        },
      },
      completed: {},
      failed: {},
    },
  });
};

function LearnPaths(
  eventStore: any,
  rfcId: string,
  currentPathExpressions: any[]
) {
  const batchHandler = batchCommandHandler(eventStore, rfcId);
  const endpointIds = [];
  //learn paths
  currentPathExpressions.forEach((i) => {
    batchHandler.doWork(({ emitCommands, queries }) => {
      const pathsById = queries.requestsState().pathComponents;
      let lastParentPathId;
      const commands = [];
      //create path if missing
      const pathComponents = pathStringToPathComponents(i.pathExpression);
      const { toAdd, lastMatch } = resolvePath(pathComponents, pathsById);
      lastParentPathId = lastMatch.pathId;
      toAdd.forEach((addition) => {
        const pathId = OpticIds.newPathId();
        const command = (addition.isParameter
          ? RequestsCommands.AddPathParameter
          : RequestsCommands.AddPathComponent)(
          pathId,
          lastParentPathId,
          cleanupPathComponentName(addition.name)
        );
        commands.push(command);
        lastParentPathId = pathId;
      });
      endpointIds.push({
        method: i.method,
        pathId: lastParentPathId,
        pathExpression: i.pathExpression,
      });
      emitCommands(commands);
    });
  });

  return {
    commands: batchHandler.getAllCommands(),
    commandsJS: batchHandler.getAllCommandsJs(),
    endpointIds,
  };
}

function prepareLearnedBodies(allBodies: ILearnedBodies[]): any[] {
  const allCommands = flattenDeep(
    allBodies.map((i) => {
      return [
        i.requests.map((req) => req.commands),
        i.responses.map((req) => req.commands),
      ];
    })
  );

  return allCommands;
}

function cleanupPathComponentName(name) {
  return name.replace(/[{}:]/gi, '');
}

export function trimTrailingEmptyPath(components) {
  if (components.length > 0) {
    if (components[components.length - 1].name === '') {
      return components.slice(0, -1);
    }
  }
  return components;
}

export function pathStringToPathComponents(pathString) {
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
