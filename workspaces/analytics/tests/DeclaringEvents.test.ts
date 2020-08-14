const { ApiCreated } = require('../src/events/onboarding');

test('Can creeate an event type', () => {
  const event = ApiCreated.withProps({ apiName: 'Hello World API' });
  expect(event).toMatchSnapshot();
  expect(ApiCreated.toSentence(event)).toMatchSnapshot();
});
