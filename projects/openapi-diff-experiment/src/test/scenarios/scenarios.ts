import {
  AgentContext,
  AgentEvent,
  AgentEventEnum,
  AgentIntent,
  WaitingOnInputDiffContext,
} from '../../interactive/agents/agent-interface';
import { baselineIntent } from '../../interactive/agents/intents/baseline';
import { OpenAPIV3 } from 'openapi-types';
import { IPatchOpenAPI } from '../../services/patch/types';
import { ApiTraffic } from '../../services/traffic/types';
import {
  AnswerQuestionTypes,
  QuestionsForAgent,
} from '../../interactive/agents/questions';
import {
  OpenApiInterface,
  SpecInterfaceFactory,
} from '../../services/openapi-read-patch-interface';
import { PassThroughSpecReader } from '../../services/read/debug-implementations';
import { StringifyReconciler } from '../../services/patch/reconcilers/stringify-reconciler';
import { PassThroughSource } from '../../services/traffic/sources/debug-implementations';
import { newDiffMachine } from '../../interactive/machine';
import { createDiffServiceWithCachingProjections } from '../../services/diff/diff-service';
import { createAgentMachine } from '../../interactive/agents/agent';
import invariant from 'ts-invariant';
import { Interpreter } from 'xstate';
import { IPatchGroup } from '../../services/patch/incremental-json-patch/json-patcher';
import {
  Context,
  InteractiveDiffEvents,
} from '../../interactive/machine-interface';

export function scenarios(intent: AgentIntent) {
  return {
    initialSpec: (spec: OpenAPIV3.Document) =>
      scenarioRunner(intent, spec, () =>
        OpenApiInterface(new PassThroughSpecReader(spec), (reader) =>
          StringifyReconciler(reader)
        )
      ),
    buildSpecFrom: async (patch: (p: IPatchOpenAPI) => void) => {
      const openApiInterface = await OpenApiInterface(
        new PassThroughSpecReader(),
        (reader) => StringifyReconciler(reader)
      );

      patch(openApiInterface.patch);

      const spec = openApiInterface.patch.forkedPatcher().currentDocument();

      return scenarioRunner(intent, spec, () =>
        OpenApiInterface(new PassThroughSpecReader(spec), (reader) =>
          StringifyReconciler(reader)
        )
      );
    },
    readFrom: (filePath: string) => {},
  };
}

export function scenarioRunner(
  intent: AgentIntent,
  spec: OpenAPIV3.Document,
  specInterfaceFactory: SpecInterfaceFactory
) {
  const source = new PassThroughSource();

  const diffService: Interpreter<Context, any, InteractiveDiffEvents> =
    newDiffMachine(
      source,
      specInterfaceFactory,
      (spec) => createDiffServiceWithCachingProjections(spec),
      {
        maxQueue: 50,
      }
    );

  const { agent } = createAgentMachine(diffService, intent);

  const interactive = {
    agentMachine: agent,
    sendTraffic: (...traffic: ApiTraffic[]) => {
      source.sendTraffic(...traffic);
    },
    source,
    spec,
    specInterfaceFactory: () => {
      return OpenApiInterface(new PassThroughSpecReader(spec), (reader) =>
        StringifyReconciler(reader)
      );
    },
    shutdown: async () => {
      agent.stop();
      diffService.stop();
    },
    waitForEmptyQueue: async () => {
      return new Promise((resolve, reject) => {
        let queue0 = false;
        let { unsubscribe } = diffService.subscribe((i) => {
          if (i.context.queue.length === 0) {
            queue0 = true;
            if (unsubscribe) unsubscribe();
            interactive.shutdown();
            resolve(undefined);
          }
        });

        setTimeout(() => {
          if (!queue0) {
            if (unsubscribe) unsubscribe();
            reject('never got to 0 queue');
          }
        }, 2000);
      });
    },
    answerQuestion: async (
      questionType: AnswerQuestionTypes,
      answer: (question: QuestionsForAgent) => void
    ) => {
      const context: WaitingOnInputDiffContext = await new Promise(
        (resolve, reject) => {
          let { unsubscribe } = agent.subscribe((i) => {
            if (i.value === 'waiting_for_input') {
              resolve(i.context as WaitingOnInputDiffContext);
              if (unsubscribe) unsubscribe();
            }
          });
          setTimeout(() => {
            reject('never got into a question state');
          }, 2000);
        }
      );
      invariant(
        context.questions[0].type === questionType,
        `expecting question type ${questionType} but got ${context.questions[0].type}`
      );

      const question = context.questions[0];
      answer(question);
      invariant(
        Boolean(question.answer),
        'expecting the agent to have answered question, got undefined'
      );

      agent.send({
        type: AgentEventEnum.AnswerQuestion,
        id: question.uuid,
        answer: question.answer,
      });

      await new Promise((resolve, reject) => {
        let { unsubscribe } = agent.subscribe((i) => {
          if (i.value === 'check_should_flush') {
            if (unsubscribe) unsubscribe();
            resolve(undefined);
          }
        });
      });
    },
    results: {
      patches: () => {
        return diffService.state.context.specInterface.patch.listPatches();
      },
      flattenedSpec: () => {
        return diffService.state.context.specInterface.patch
          .forkedPatcher()
          .currentDocument();
      },
      fileSystemPatches: () => {},
    },
  };

  return interactive;
}
