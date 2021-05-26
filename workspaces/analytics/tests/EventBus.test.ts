import { newAnalyticsEventBus } from '../src/eventbus';
import { CliClientContext } from '../src/interfaces/TrackingEventBase';
import { UserLoggedInFromCLI } from '../src/cliEvents';
const getContext: (batchId: string) => Promise<CliClientContext> = async () => {
  return {
    clientId: 'testing',
    platform: 'furby',
    arch: 'mips',
    release: '1998',
    apiName: 'testingApiName',
    clientSessionInstanceId: 'testing',
    clientTimestamp: 'testingTime',
    clientAgent: 'testingAgent',
    source: 'user',
  };
};

test('Event Bus can listen for analytics events', async (done) => {
  const bus = newAnalyticsEventBus(getContext);

  new Promise((resolve) => {
    bus.listen((e) => {
      expect(e).toMatchSnapshot();
      resolve(null);
    });
  }).then(done);

  bus.emit(UserLoggedInFromCLI({ userId: 'hello' }));
});
