import { Client } from '@useoptic/cli-client';
import * as Sentry from '@sentry/react';
import * as FullStory from '@fullstory/browser';
import { LogLevel } from '@sentry/types';
import { AnalyticsStoreProps } from '../AnalyticsStore';
import { getOrSetAgentFromLocalStorage } from '../utils';

const packageJson = require('../../../package.json');
const clientId = `local_cli_${packageJson.version}`;

const fetchIdentity = async () => {
  const cliClient = new Client('/api');
  try {
    const response = await cliClient.getIdentity();
    if (response.ok) {
      const { anonymousId } = await response.json();
      return anonymousId;
    } else {
      throw new Error();
    }
  } catch (e) {
    return getOrSetAgentFromLocalStorage('anon_id');
  }
};

export const getMetadata: (
  apiNameFetcher: () => Promise<string>
) => AnalyticsStoreProps['getMetadata'] = (apiNameFetcher) => async () => {
  const clientAgent = await fetchIdentity();
  const apiName = await apiNameFetcher();

  return {
    clientId,
    clientAgent,
    apiName,
  };
};

export const initialize: AnalyticsStoreProps['initialize'] = async (
  metadata,
  appConfig
) => {
  if (!appConfig.analytics.enabled) {
    return;
  }

  if (appConfig.analytics.fullStoryOrgId) {
    FullStory.init({ orgId: appConfig.analytics.fullStoryOrgId });
  }

  if (appConfig.analytics.sentryUrl) {
    Sentry.init({
      dsn: appConfig.analytics.sentryUrl,
      release: clientId,
      logLevel: LogLevel.Debug,
    });
    Sentry.setUser({ id: metadata.clientAgent });
  }
};

export const track: AnalyticsStoreProps['track'] = async (event, metadata) => {
  const cliClient = new Client('/api');

  // TODO consolidate UI and cli events types
  cliClient.postTrackingEvents([
    {
      type: event.name,
      data: event.properties,
      // TODO update the context typing, this currently gets overriden in
      // the event bus
      context: {
        clientId: clientId,
        platform: '',
        arch: '',
        release: '',
        apiName: metadata.apiName,
        clientSessionInstanceId: '',
        clientTimestamp: '',
        clientAgent: metadata.clientAgent,
        source: '',
      },
    },
  ]);
  try {
    FullStory.event(event.name, event.properties);
  } catch (e) {}
};
