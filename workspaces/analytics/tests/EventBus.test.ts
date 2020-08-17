import { newAnalyticsEventBus } from '../src/eventbus';
import { ClientContext } from '../src/interfaces/TrackingEventBase';
const { ApiCreated } = require('../src/events/onboarding');

const getContext: (batchId: string) => Promise<ClientContext> = async () => {
  return {
    clientId: 'testing',
    clientSessionInstanceId: 'testing',
    clientTimestamp: 'testing',
    clientAgent: 'testing',
  };
};

test('Event Bus can listen for analytics events', async (done) => {
  const bus = newAnalyticsEventBus(getContext);

  const promise = new Promise((resolve) => {
    bus.listen((e) => {
      expect(e).toMatchSnapshot();
      resolve();
    });
  }).then(done);

  bus.emit(ApiCreated.withProps({ apiName: 'Hello World API' }));
});
