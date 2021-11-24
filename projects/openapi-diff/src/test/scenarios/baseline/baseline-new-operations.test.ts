import { AnswerQuestionTypes } from '../../../interactive/agents/questions';
import { emptySpec, oneEndpointExampleSpec } from '../specs';
import { DebugTraffic } from '../traffic';

describe('baseline new operations', () => {
  it('asks question for a new path', async () => {
    const scenario = emptySpec();
    scenario.sendTraffic(
      DebugTraffic('get', '/example').withJsonResponse({ hello: 'world' })
    );

    await scenario.answerQuestion(AnswerQuestionTypes.AddPath, (question) => {
      question.answer = {
        pathPattern: '/example',
      };
    });

    await scenario.waitForEmptyQueue();

    expect(scenario.results.flattenedSpec()).toMatchSnapshot();
  });

  it('autolearns new http methods on matched paths', async () => {
    const scenario = await oneEndpointExampleSpec();

    scenario.sendTraffic(
      DebugTraffic('put', '/example').withJsonResponse({ hello: 'world' })
    );

    await scenario.waitForEmptyQueue();

    expect(scenario.results.flattenedSpec()).toMatchSnapshot();
  });

  it('autolearns new properties in matched bodies', async () => {
    const scenario = await oneEndpointExampleSpec();

    scenario.sendTraffic(
      DebugTraffic('get', '/example').withJsonResponse({
        hello: 'world',
        goodbye: 'saturn',
      })
    );

    await scenario.waitForEmptyQueue();

    expect(scenario.results.flattenedSpec()).toMatchSnapshot();
  });

  it('autolearns new query parameters on matched endpoints', async () => {
    const scenario = await oneEndpointExampleSpec();

    scenario.sendTraffic(
      DebugTraffic('get', '/example')
        .withJsonResponse({ hello: 'world' })
        .withQuery('limit=50')
    );

    await scenario.waitForEmptyQueue();

    expect(scenario.results.flattenedSpec()).toMatchSnapshot();
  });

  it('autolearns new response status codes on matched paths', async () => {
    const scenario = await oneEndpointExampleSpec();

    scenario.sendTraffic(
      DebugTraffic('get', '/example')
        .withStatusCode('404')
        .withJsonResponse({ error: 'look here...' })
    );

    await scenario.waitForEmptyQueue();

    expect(scenario.results.flattenedSpec()).toMatchSnapshot();
  });
});
