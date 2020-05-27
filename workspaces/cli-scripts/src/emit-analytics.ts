// @ts-ignore
import Analytics from 'analytics-node';

function run(token: string, jsonString: string) {
  const analytics = new Analytics(token, {
    flushAt: 1,
  });

  const { event, userId, properties } = JSON.parse(jsonString);

  analytics.track({ event, userId, properties });
}

const [, , token, jsonString] = process.argv;
run(token, jsonString);
