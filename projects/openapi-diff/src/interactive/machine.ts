import {
  assign,
  createMachine,
  DoneInvokeEvent,
  interpret,
  Interpreter,
} from 'xstate';
import {
  baselineDefaults,
  Context,
  DiffEventEnum,
  InteractiveDiffEvents,
  InteractiveDiffMachineOptions,
} from './machine-interface';
import { ApiTraffic, TrafficSource } from '../services/traffic/types';
import {
  DiffServiceFactoryFunction,
  DiffType,
  IDiff,
} from '../services/diff/types';
import { SpecInterfaceFactory } from '../services/openapi-read-patch-interface';
import { AgentLogEvent, AgentLogEvents } from './agents/agent-log-events';
import {
  watchDependencies,
  WatchDependenciesHandler,
} from '@useoptic/openapi-io';

export type InteractiveDiffMachineType = Interpreter<
  Context,
  any,
  InteractiveDiffEvents
>;

export function newDiffMachine(
  source: TrafficSource,
  specInterfaceFactory: SpecInterfaceFactory,
  diffServiceFactory: DiffServiceFactoryFunction,
  options: InteractiveDiffMachineOptions = baselineDefaults,
  log: (logEvent: AgentLogEvent) => void = () => {}
): Interpreter<Context, any, InteractiveDiffEvents> {
  const addOrDropQueue = (context: Context, item: ApiTraffic) => {
    const mustSkip = context.queue.length === options.maxQueue;
    // log({
    //   event: AgentLogEvents.observedTraffic,
    //   path: item.path,
    //   method: item.method,
    //   status: mustSkip ? 'enqueued' : 'dropped',
    // });
    const skippedCount = mustSkip
      ? context.skippedCount + 1
      : context.skippedCount;
    const observedCount = context.observedCount + 1;
    const newQueue = mustSkip ? context.queue : [...context.queue, item];
    return { skippedCount, observedCount, queue: newQueue };
  };

  const dropFirstItemFromQueue = (context: Context) => {
    const newArray = [...context.queue];
    newArray.shift();
    return newArray;
  };

  const alwaysHandleNewTraffic = {
    [DiffEventEnum.Traffic_Observed]: {
      actions: assign(
        (
          context: Context,
          event: { example: ApiTraffic; type: DiffEventEnum.Traffic_Observed }
        ) => {
          return { ...addOrDropQueue(context, event.example) };
        }
      ),
      target: 'check_next',
    },
  };

  const handleNewTrafficInBackground = {
    [DiffEventEnum.Traffic_Observed]: {
      actions: assign(
        (
          context: Context,
          event: { example: ApiTraffic; type: DiffEventEnum.Traffic_Observed }
        ) => {
          return { ...addOrDropQueue(context, event.example) };
        }
      ),
    },
  };

  let watchDependenciesHandler: WatchDependenciesHandler | undefined;

  const differ = createMachine<Context, InteractiveDiffEvents>({
    id: 'diff-machine',
    initial: 'reading_spec',
    context: {
      totalPatchesSaved: 0,
      diffsCount: 0,
      observedCount: 0,
      skippedCount: 0,
      queue: [],
      diffs: [],
      diffService: undefined,
      specInterface: undefined,
    },
    states: {
      reading_spec: {
        invoke: {
          src: async (ctx) => {
            const specInterface = ctx.specInterface
              ? await ctx.specInterface
              : await specInterfaceFactory();

            // if already instantiated, reload
            if (ctx.specInterface) {
              await specInterface.read.reload();
            }

            log({
              event: AgentLogEvents.reading,
              location: specInterface.read.describeLocation(),
            });

            if (ctx.specInterface) {
              await ctx.specInterface.resetPatch();
            }

            return {
              diffService: diffServiceFactory(
                await specInterface.read.questions()
              ),
              specInterface,
            };
          },
          onDone: {
            actions: assign((ctx, event) => ({
              diffService: event.data.diffService,
              specInterface: event.data.specInterface,
            })),
            target: 'check_next',
          },
          onError: {
            // @todo fill me out
          },
        },
        on: {
          ...alwaysHandleNewTraffic,
        },
      },
      observing: {
        on: {
          ...alwaysHandleNewTraffic,
        },
      },
      check_next: {
        always: [
          {
            target: 'reading_spec',
            cond: (ctx) => typeof ctx.diffService === 'undefined',
          },
          { target: 'diffing', cond: (ctx, event) => ctx.queue.length > 0 },
          { target: 'observing' },
        ],
        on: {
          ...alwaysHandleNewTraffic,
        },
      },
      diffing: {
        on: {
          ...handleNewTrafficInBackground,
        },
        invoke: {
          src: async (ctx): Promise<IDiff[]> => {
            const example = ctx.queue[0];
            const results = await ctx.diffService.compare(example);

            log({
              event: AgentLogEvents.diffingTraffic,
              method: example.method,
              path: example.path,
              statusCode: example.response.statusCode,
              hasDiffs: results.diffs.length > 0,
            });

            results.errors.forEach((error) =>
              log({
                event: AgentLogEvents.error,
                error,
              })
            );

            if (
              results.diffs.some(
                (i) =>
                  i.type === DiffType.UnmatchedPath ||
                  i.type === DiffType.UnmatchedMethod
              )
            ) {
              // agent.log({
              //   event: AgentLogEvents.observedTraffic,
              //   path: example.path,
              //   method: example.method,
              // });
            }
            // results.errors log these
            return results.diffs;
          },
          onDone: [
            // don't drop from queue until it's empty or skipped
            {
              target: 'waiting_for_input',
              actions: assign((ctx, data: DoneInvokeEvent<IDiff[]>) => ({
                diffs: data.data,
              })),
              cond: (ctx, data: DoneInvokeEvent<IDiff[]>) => {
                return data.data.length > 0;
              },
            },
            {
              actions: assign((ctx) => ({
                queue: dropFirstItemFromQueue(ctx),
              })),
              target: 'check_next',
            },
          ],
        },
      },
      waiting_for_input: {
        on: {
          ...handleNewTrafficInBackground,
          [DiffEventEnum.Agent_Submitted_Patch]: {
            target: 'apply_changes',
            actions: assign((ctx, event) => ({
              // if the agent suspects there will be future diffs, allow it to keep the head in the queue.
              queue: event.dropCurrentTraffic
                ? dropFirstItemFromQueue(ctx)
                : ctx.queue,
            })),
          },
          [DiffEventEnum.Agent_Skipped_Interaction]: {
            target: 'check_next',
            actions: assign((ctx) => ({
              queue: dropFirstItemFromQueue(ctx),
            })),
          },
          [DiffEventEnum.Reread_Specification]: {
            actions: assign((ctx) => ({
              diffService: undefined,
              diffs: [],
            })),
            target: 'reading_spec',
          },
          // add to the queue, but do not leave until we have our answer
          [DiffEventEnum.Traffic_Observed]: {
            actions: assign(
              (
                context: Context,
                event: {
                  example: ApiTraffic;
                  type: DiffEventEnum.Traffic_Observed;
                }
              ) => {
                return { ...addOrDropQueue(context, event.example) };
              }
            ),
          },
        },
        /*
        This allows for real time collaboration between human spec writer and Optic
        - known limitation, if they get spec into invalid sate it'll go into an error state.
         */
        entry: (ctx, event) => {
          if (ctx.specInterface.read.mode === 'filesystem') {
            if (watchDependenciesHandler)
              watchDependenciesHandler.stopWatching();
            ctx.specInterface.read.sourcemap().then((sourcemap) => {
              watchDependenciesHandler = watchDependencies(
                sourcemap,
                (file) => {
                  service.send({ type: DiffEventEnum.Reread_Specification });
                }
              );
            });
          }
        },
        exit: (ctx, event) => {
          if (watchDependenciesHandler) {
            watchDependenciesHandler.stopWatching();
            watchDependenciesHandler = undefined;
          }
        },
      },
      apply_changes: {
        on: {
          ...handleNewTrafficInBackground,
        },
        invoke: {
          src: async (ctx) => {
            log({
              event: AgentLogEvents.patching,
              patches: ctx.specInterface.patch
                .listPatches()
                .map((i) => i.intent),
            });
            // const allPatches = ctx.specInterface.patch.listPatches();
            await ctx.specInterface.patch.save({ dryRun: false });
          },
          onDone: {
            actions: assign((ctx, event) => ({
              diffService: undefined,
              diffs: [],
              totalPatchesSaved:
                ctx.totalPatchesSaved +
                ctx.specInterface.patch.listPatches().length,
            })),
            target: 'reading_spec',
          },
          onError: {},
        },
      },
    },
  });

  const service = interpret(differ);

  service.start();

  // connect traffic source to machine
  source.on('traffic', (example: ApiTraffic) => {
    service.send({ type: DiffEventEnum.Traffic_Observed, example });
  });

  return service;
}
