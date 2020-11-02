import { InteractiveSessionConfig } from '../interfaces/session';
import { assign, Machine } from 'xstate';
import { IAllChanges, IChanges } from '../hooks/session-hook';
import workerpool from 'workerpool';
import {
  Facade,
  JsonHelper,
  opticEngine,
  OpticIds,
  RequestsCommands,
  RfcCommandContext,
} from '@useoptic/domain';
import uuidv4 from 'uuid/v4';
import { resolvePath } from '../../components/utilities/PathUtilities';
import { batchCommandHandler } from '../../components/utilities/BatchCommandHandler';
import flattenDeep from 'lodash.flattendeep';
import Bottleneck from 'bottleneck';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';
import { universeFromEventsAndAdditionalCommands } from '@useoptic/domain-utilities';
export interface ApplyChangesStateSchema {
  states: {
    staged: {};
    generatingNewPaths: {};
    generatingNewBodyCommands: {};
    collectingApprovedSuggestions: {};
    runningCommands: {};
    completed: {};

    failed: {};
  };
}

// The events that the machine handles
export type ApplyChangesEvent =
  | { type: 'START' }
  | { type: 'INCREMENT_BODIES_PROGRESS' };

export interface ApplyChangesContext {
  newPaths: {
    commands: any[];
    commandsJS: any[];
    endpointIds: { pathId: string; method: string }[];
  };
  newBodiesProgress: number;
  newBodiesLearned: ILearnedBodies[] | undefined;
  approvedSuggestionsCommands: any[];
  updatedEvents: any[];
}

// The context (extended state) of the machine
export interface ApplyChangesContext {}

export const newApplyChangesMachine = (
  patch: IAllChanges,
  services: InteractiveSessionConfig,
  clientSessionId: string = 'default',
  clientId: string = 'default'
) => {
  return Machine<
    ApplyChangesContext,
    ApplyChangesStateSchema,
    ApplyChangesEvent
  >({
    id: 'apply-changes',
    context: {
      newPaths: { commands: [], commandsJS: [], endpointIds: [] },
      newBodiesProgress: 0,
      newBodiesLearned: undefined,
      approvedSuggestionsCommands: [],
      updatedEvents: [],
    },
    initial: 'staged',
    states: {
      staged: {
        on: {
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
            target: 'failed',
          },
        },
      },
      generatingNewBodyCommands: {
        invoke: {
          id: 'body-generating',
          src: (context, event) => async (callback, onReceive) => {
            const { endpointIds, commands } = context.newPaths;

            if (endpointIds.length === 0) {
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

            const results = endpointIds.map(
              async ({ pathId, method }, index) => {
                return await throttler.schedule(async () => {
                  console.log(`learning started for ${pathId} ${method}`);
                  let promise;
                  batchHandler.doWork(async ({ rfcService, rfcId }) => {
                    promise = services.diffService.learnInitial(
                      rfcService,
                      rfcId,
                      pathId,
                      method
                    );
                  });

                  promise.finally(() => {
                    console.log(`learning finished ${pathId} ${method}`);
                    callback({ type: 'INCREMENT_BODIES_PROGRESS' });
                  });

                  return await promise;
                });
              }
            );

            const allBodies: ILearnedBodies[] = await Promise.all(results);
            return allBodies;
          },
          onDone: {
            target: 'collectingApprovedSuggestions',
            actions: assign({
              newBodiesLearned: (context, event) => event.data,
            }),
          },
          onError: {
            target: 'failed',
          },
        },
        on: {
          INCREMENT_BODIES_PROGRESS: {
            actions: assign({
              newBodiesProgress: (context, _) => context.newBodiesProgress + 1,
            }),
          },
        },
      },
      collectingApprovedSuggestions: {
        invoke: {
          id: 'collecting-commands-from-suggestions',
          src: async (context, event) => {
            Promise.resolve([]);
          },
          onDone: {
            target: 'runningCommands',
            actions: assign({
              approvedSuggestionsCommands: (context, event) => event.data,
            }),
          },
          onError: {
            target: 'failed',
          },
        },
      },
      runningCommands: {
        invoke: {
          id: 'running-commands',
          src: async (context, event) => {
            const allCommandsToRun = [
              ...context.newPaths.commandsJS,
              ...prepareLearnedBodies(context.newBodiesLearned || []),
            ];

            const pool1 = workerpool.pool();
            // do me on a web worker
            return await pool1.exec(handleCommands, [
              allCommandsToRun,
              services.rfcBaseState.eventStore.serializeEvents(
                services.rfcBaseState.rfcId
              ),
              uuidv4(),
              clientSessionId,
              clientId,
            ]);
          },
          onDone: {
            target: 'completed',
            actions: assign({
              updatedEvents: (context, event) => event.data,
            }),
          },
          onError: {
            actions: (context, event) => {
              console.error(event);
            },
            target: 'failed',
          },
        },
      },
      completed: {
        entry: (context) => {
          console.log(context.updatedEvents);
        },
      },
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
      endpointIds.push({ method: i.method, pathId: lastParentPathId });
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

function handleCommands(
  commands: any[],
  eventString: string,
  batchId: string,
  clientSessionId: string,
  clientId: string
): any[] {
  const {
    opticEngine,
    RfcCommandContext,
    JsonHelper,
  } = require('@useoptic/domain');
  const {
    universeFromEventsAndAdditionalCommands,
  } = require('@useoptic/domain-utilities');

  const {
    StartBatchCommit,
    EndBatchCommit,
  } = opticEngine.com.useoptic.contexts.rfc.Commands;

  const inputCommands = JsonHelper.vectorToJsArray(
    opticEngine.CommandSerialization.fromJs(commands)
  );

  const commandContext = new RfcCommandContext(
    clientId,
    clientSessionId,
    batchId
  );

  const { rfcId, eventStore } = universeFromEventsAndAdditionalCommands(
    JSON.parse(eventString),
    commandContext,
    inputCommands
  );

  return JSON.parse(eventStore.serializeEvents(rfcId));
}
