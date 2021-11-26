import { assign, createMachine, interpret } from 'xstate';
import {
  AgentContext,
  AgentEvent,
  AgentEventEnum,
  AgentIntent,
  AgentTypestate,
  ProcessDiffContext,
  WaitingOnInputDiffContext,
} from './agent-interface';
import isEqual from 'lodash.isequal';
import { InteractiveDiffMachineType } from '../machine';
import { IDiff } from '../../services/diff/types';
import { QuestionsForAgent } from './questions';
import { ApiTraffic } from '../../services/traffic/types';
import { DiffEventEnum } from '../machine-interface';

export function createAgentMachine(
  diffMachine: InteractiveDiffMachineType,
  intent: AgentIntent
) {
  const agentMachine = createMachine<AgentContext, AgentEvent, AgentTypestate>({
    id: 'agent',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        entry: assign({}),
        on: {
          [AgentEventEnum.DiffReceived]: {
            target: 'process_diffs',
            actions: assign((context, event) => {
              return {
                diffs: event.diffs,
                traffic: event.traffic,
                questions: [],
              };
            }),
          },
        },
      },
      process_diffs: {
        invoke: {
          // this entire src could be made a service for other kinds of diff intents
          src: async (
            ctx,
            event
          ): Promise<{ questions: QuestionsForAgent[] }> => {
            const { diffs, traffic } = ctx as ProcessDiffContext;

            // for user input
            const questions: QuestionsForAgent[] = [];
            // use this to patch diffs this intent automates
            const { specInterface, diffService } = diffMachine.state.context;

            diffs.forEach((diff) =>
              intent.handleDiffs(
                diff,
                traffic,
                specInterface.patch,
                diffService,
                (question) => {
                  questions.push(question);
                }
              )
            );

            // if automated patches are dispatched, we run these first
            // if (specInterface.patch.listPatches().length) {
            //   // diffMachine.send({
            //   //   type: DiffEventEnum.Agent_Submitted_Patch,
            //   // });
            //   return { questions: [] };
            // }

            return { questions };
          },
          onDone: [
            {
              target: 'check_should_flush',
              actions: assign((ctx, event) => {
                return {
                  questions: event.data.questions,
                };
              }),
            },
          ],
          onError: {
            actions: (ctx, event) => {
              console.log(event);
            },
          },
        },
      },
      waiting_for_input: {
        on: {
          [AgentEventEnum.Reset]: {
            target: 'idle',
          },
          [AgentEventEnum.SkipInteraction]: {
            actions: (ctx, event) => {
              diffMachine.send({
                type: DiffEventEnum.Agent_Skipped_Interaction,
              });
            },
            target: 'idle',
          },
          [AgentEventEnum.SkipQuestion]: {
            actions: assign((ctx) => {
              const newQuestions = (ctx as WaitingOnInputDiffContext).questions;
              newQuestions.shift();
              return { questions: newQuestions };
            }),
            target: 'check_should_flush',
          },
          [AgentEventEnum.AnswerQuestion]: {
            actions: assign((ctx, event) => {
              const context = ctx as WaitingOnInputDiffContext;
              const { specInterface } = diffMachine.state.context;
              const question = context.questions.find(
                (i) => i.uuid === event.id
              );
              if (question) {
                question.answer = event.answer;
              }
              intent.applyAnswerAsPatch(question, specInterface.patch);
              return { questions: context.questions };
            }),
            target: 'check_should_flush',
          },
        },
      },
      check_should_flush: {
        invoke: {
          src: async (ctx) => {
            const context = ctx as WaitingOnInputDiffContext;
            const { specInterface } = diffMachine.state.context;

            const result = { shouldIdle: true, shouldFlush: false };

            if (
              context.questions.length > 0 &&
              context.questions.some((i) => i.answer)
            ) {
              result.shouldFlush = true;
            }

            if (
              context.questions.length > 0 &&
              context.questions.every((i) => !i.answer)
            ) {
              result.shouldFlush = false;
              result.shouldIdle = false;
            }

            if (
              context.questions.length === 0 &&
              specInterface.patch.listPatches().length > 0
            ) {
              result.shouldFlush = true;
            }

            return result;
          },
          onDone: [
            {
              target: 'idle',
              actions: (ctx) => {
                const additionalQuestions = ctx as WaitingOnInputDiffContext;
                const dropCurrentTraffic = !additionalQuestions.questions.some(
                  (i) => !i.answer
                );

                diffMachine.send({
                  type: DiffEventEnum.Agent_Submitted_Patch,
                  dropCurrentTraffic,
                });
              },
              cond: (ctx, event) => event.data.shouldFlush,
            },
            {
              target: 'idle',
              cond: (ctx, event) => event.data.shouldIdle,
            },
            { target: 'waiting_for_input' },
          ],
          onError: {
            actions: [
              (ctx, error) => {
                console.error(error);
                diffMachine.send({
                  type: DiffEventEnum.Agent_Skipped_Interaction,
                });
              },
            ],
            target: 'idle',
          },
        },
      },
    },
  });

  const service = interpret(agentMachine);

  service.start();

  // response to state changes of diff machine
  let previousAsk: { diffs: IDiff[]; traffic: ApiTraffic } | undefined;

  diffMachine.onTransition((state, event) => {
    // transitioned to waiting_for_input

    if (state.value === 'waiting_for_input') {
      if (
        !isEqual(previousAsk, {
          diffs: state.context.diffs,
          traffic: state.context.queue[0],
        })
      ) {
        service.send({
          type: AgentEventEnum.DiffReceived,
          diffs: state.context.diffs,
          traffic: state.context.queue[0],
        });
        previousAsk = {
          diffs: state.context.diffs,
          traffic: state.context.queue[0],
        };
      }
    } else {
      previousAsk = undefined;
      service.send({
        type: AgentEventEnum.Reset,
      });
    }
  });

  return { agent: service, diffMachine: diffMachine };
}
