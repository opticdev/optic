import { DebugSource } from '../../../services/traffic/sources/debug-implementations';
import { makeExample } from '../../../services/traffic/traffic/debug-simple';
import { newDiffMachine } from '../../machine';
import { OpenApiInterface } from '../../../services/openapi-read-patch-interface';
import { PassThroughSpecReader } from '../../../services/read/debug-implementations';
import { StringifyReconciler } from '../../../services/patch/reconcilers/stringify-reconciler';
import { waitFor } from '../../../utils/debug_waitFor';
import { createDiffServiceWithCachingProjections } from '../../../services/diff/diff-service';
import { ApiTraffic } from '../../../services/traffic/types';
import { createAgentMachine } from '../agent';
import { AgentEventEnum, WaitingOnInputDiffContext } from '../agent-interface';
import { baselineIntent } from '../intents/baseline';
import { AnswerQuestionTypes } from '../questions';

describe('baseline agents', () => {
  it('learn API one path at a time', async () => {
    const diffServiceHandlingTraffic = await exampleFixture([
      // ask me about this
      makeExample('/examples', 'get', '200', { items: ['world'] }),
      // do not ask me about this, just learn it
      makeExample('/examples', 'post', '200', { items: ['world'] }),
      // ask about this
      makeExample('/examples/example123', 'get', '200', {
        name: 'example',
        size: 'medium',
      }),
    ]);

    const machine = createAgentMachine(
      diffServiceHandlingTraffic,
      baselineIntent()
    );

    const pathPattenAnswers = ['/examples', '/examples/{exampleId}'];

    machine.onTransition((state) => {
      const context = state.context as WaitingOnInputDiffContext;
      if (state.value === 'waiting_for_input') {
        if (
          context.questions[0] &&
          context.questions[0].type === AnswerQuestionTypes.AddPath
        ) {
          const answer = pathPattenAnswers.shift();
          if (answer) {
            machine.send({
              type: AgentEventEnum.AnswerQuestion,
              id: context.questions[0].uuid,
              answer: {
                pathPattern: answer,
              },
            });
          }
        }
      }
    });
    await waitFor(500);
    const resultingSpec =
      await diffServiceHandlingTraffic.state.context.specInterface.read.flattenedSpecification();
    expect(resultingSpec).toMatchSnapshot();
  });

  it('automatically approve property diffs', async () => {
    const diffServiceHandlingTraffic = await exampleFixture([
      // baseline
      makeExample('/examples', 'get', '200', { field1: 'hello' }),
      // new field, and one of
      makeExample('/examples', 'get', '200', {
        field1: 123,
        field2: [{ size: 'sm' }, { size: 'xl' }],
      }),
      // new field made optional
      makeExample('/examples', 'get', '200', {
        field1: 123,
      }),
    ]);

    const machine = createAgentMachine(
      diffServiceHandlingTraffic,
      baselineIntent()
    );

    const pathPattenAnswers = ['/examples'];

    machine.onTransition((state) => {
      const context = state.context as WaitingOnInputDiffContext;
      if (state.value === 'waiting_for_input') {
        if (
          context.questions[0] &&
          context.questions[0].type === AnswerQuestionTypes.AddPath
        ) {
          const answer = pathPattenAnswers.shift();
          if (answer) {
            machine.send({
              type: AgentEventEnum.AnswerQuestion,
              id: context.questions[0].uuid,
              answer: {
                pathPattern: answer,
              },
            });
          }
        }
      }
    });

    await waitFor(500);
    const resultingSpec =
      await diffServiceHandlingTraffic.state.context.specInterface.read.flattenedSpecification();
    expect(resultingSpec).toMatchSnapshot();
  });

  it('automatically approve new response types', async () => {
    const diffServiceHandlingTraffic = await exampleFixture([
      // baseline
      makeExample('/examples', 'get', '200', { field1: 'hello' }),
      // new field, and one of
      makeExample('/examples', 'get', '404', {
        error: "it's broken",
      }),
    ]);

    const machine = createAgentMachine(
      diffServiceHandlingTraffic,
      baselineIntent()
    );

    const pathPattenAnswers = ['/examples'];

    machine.onTransition((state) => {
      const context = state.context as WaitingOnInputDiffContext;
      if (state.value === 'waiting_for_input') {
        if (
          context.questions[0] &&
          context.questions[0].type === AnswerQuestionTypes.AddPath
        ) {
          const answer = pathPattenAnswers.shift();
          if (answer) {
            machine.send({
              type: AgentEventEnum.AnswerQuestion,
              id: context.questions[0].uuid,
              answer: {
                pathPattern: answer,
              },
            });
          }
        }
      }
    });

    await waitFor(500);
    const resultingSpec =
      await diffServiceHandlingTraffic.state.context.specInterface.read.flattenedSpecification();
    expect(resultingSpec).toMatchSnapshot();
  });
});

async function exampleFixture(examples: ApiTraffic[]) {
  const source = new DebugSource(
    examples,
    // [
    // makeExample("/examples/123", "get", "200"),
    // makeExample("/examples/456", "get", "200"),
    // makeExample("/examples/789", "get", "200"),
    // makeExample("/examples/101112", "get", "200"),
    // makeExample("/examples", "post", "200"),
    // ],
    10
  );

  const diffService = newDiffMachine(
    source,
    () =>
      OpenApiInterface(new PassThroughSpecReader(), (reader) =>
        StringifyReconciler(reader)
      ),
    (spec) => createDiffServiceWithCachingProjections(spec),
    {
      maxQueue: 10,
    }
  );

  await source.start();

  return diffService;
}
