import { Client } from '@useoptic/cli-client';

let isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS !== 'no';

const readyPromise = new Promise(async (resolve) => {
  const client = new Client('/api');
  if (isAnalyticsEnabled) {
    const response = client.getIdentity();
    if (response.ok) {
      const { user } = await response.json();
      window.FS.identify(user.sub, {
        displayName: user.name,
        email: user.email,
      });
      window.analytics.identify(user.sub, {
        name: user.name,
        email: user.email,
      });
      window.Intercom('update', { name: user.name, email: user.email });
    }
    resolve();
  } else {
    console.warn('Analytics is disabled');
    try {
      window.FS.shutdown();
    } catch (e) {}
    resolve();
  }
});

export async function touchAnalytics() {
  await readyPromise;
  console.log('analytics loaded');
}

export async function track(event, props) {
  await readyPromise;
  if (isAnalyticsEnabled) {
    window.analytics.track(event, props);
  }
}
