import { assign, Machine, send } from 'xstate';
import { ISpecService } from '@useoptic/cli-client/build/spec-service-client';
import { CheckAssertionsResult } from '@useoptic/analytics/lib/interfaces/ApiCheck';
import { rangesFromOpticYaml, RangesFromYaml } from './yaml/YamlHelper';
import { integrationDocsOptions } from './fetch-docs/IntegrationDocs';

export interface SetupAndCheckMachineSchema {
  states: {
    loading: {};
    saving: {};
    precheck: {};
    passedcheck: {};
  };
}

export type SetupAndCheckMachineEvents =
  | { type: 'USER_UPDATED_CONFIG'; contents: string }
  | { type: 'USER_FINISHED_CHANGING_CONFIG' }
  | { type: 'USER_TOGGLED_MODE'; mode: string }
  | { type: 'USER_SELECTED_FRAMEWORK'; framework: string }
  | { type: 'CHECK_RESULT_RECEIVED'; result: CheckAssertionsResult };

export interface SetupAndCheckMachineContext {
  lastKnownSavedConfig: string;
  stagedConfig: string;
  stagedRanges: RangesFromYaml;
  mode: string;
  framework: string;
  checkCount: number;
  lastCheckResult?: CheckAssertionsResult;
}

export const newSetupAndCheckMachine = (
  taskName: string,
  specService: ISpecService
) => {
  return Machine<
    SetupAndCheckMachineContext,
    SetupAndCheckMachineSchema,
    SetupAndCheckMachineEvents
  >({
    id: 'setup-' + taskName,
    context: {
      mode: 'recommended',
      lastKnownSavedConfig: '',
      stagedConfig: '',
      framework: undefined,
      stagedRanges: {
        isValid: false,
      },
      checkCount: 0,
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: async () => {
            const { configRaw } = await specService.loadConfig();
            return configRaw;
          },
          onDone: {
            actions: assign({
              lastKnownSavedConfig: (ctx, event) => event.data,
              stagedConfig: (ctx, event) => event.data,
              stagedRanges: (ctx, event) =>
                rangesFromOpticYaml(event.data, taskName),
            }),
            target: 'precheck',
          },
        },
      },
      saving: {
        invoke: {
          src: async (context, event) => {
            return await specService.saveConfig(context.stagedConfig);
          },
          onDone: {
            actions: assign({
              lastKnownSavedConfig: (ctx) => ctx.stagedConfig,
            }),
            target: 'precheck',
          },
        },
      },
      precheck: {
        on: {
          USER_FINISHED_CHANGING_CONFIG: 'saving',
          USER_UPDATED_CONFIG: {
            actions: assign({
              stagedConfig: (ctx, event) => event.contents,
              stagedRanges: (ctx, event) =>
                rangesFromOpticYaml(event.contents, taskName),
            }),
          },
          USER_TOGGLED_MODE: {
            actions: assign({
              mode: (_, event) => event.mode,
            }),
          },
          USER_SELECTED_FRAMEWORK: {
            actions: [
              assign({
                framework: (_, event) => event.framework,
              }),
              send((ctx) => ({
                type: 'USER_UPDATED_CONFIG',
                contents: updateConfig(
                  ctx.mode,
                  ctx.framework,
                  ctx.stagedConfig,
                  taskName,
                  ctx.stagedRanges
                ),
              })),
            ],
          },
          CHECK_RESULT_RECEIVED: [
            {
              cond: (_, event) => event.result.taskName === taskName,
              actions: [
                assign({
                  lastCheckResult: (_, event) => event.result,
                  lastKnownSavedConfig: (_, event) => event.result.rawConfig,
                  stagedConfig: (_, event) => event.result.rawConfig,
                  checkCount: (ctx) => ctx.checkCount + 1,
                }),
              ],
            },
            {
              cond: (_, event) => event.result.passed,
              target: 'passedcheck',
            },
          ],
        },
      },
      passedcheck: {},
    },
  });
};

function updateConfig(
  mode: string,
  framework: string,
  currentStaged: string,
  taskName: string,
  stagedRanges: RangesFromYaml
) {
  function replaceRange(
    s: string,
    start: number,
    end: number,
    substitute: string
  ): string {
    return s.substring(0, start) + substitute + s.substring(end);
  }

  if (stagedRanges.taskRange) {
    const { taskRange } = stagedRanges;
    const { startPosition, endPosition } = taskRange;

    if (mode === 'recommended') {
      const docs = integrationDocsOptions.find((i) => i.value === framework);
      console.log(docs);
      const startCommand = docs
        ? docs.data.start_command
        : 'echo "Replace me with your start command"';

      const inboundUrl =
        (stagedRanges.task && stagedRanges.task.inboundUrl.value!) ||
        'http://localhost:3005';

      const template =
        `${taskName}:\n` +
        `    command: ${startCommand}\n` +
        `    inboundUrl: ${inboundUrl}`;

      const replacement = replaceRange(
        currentStaged,
        stagedRanges.taskRange.startPosition,
        stagedRanges.taskRange.endPosition,
        template
      );

      return replacement;
    }
  }
  return currentStaged;
}
