import { Client } from '@useoptic/cli-client';
import * as Sentry from '@sentry/react';
import * as FullStory from '@fullstory/browser';
import { LogLevel } from '@sentry/types';
import { AnalyticsStoreProps } from '../AnalyticsStore';
import { getOrSetAgentFromLocalStorage } from '../utils';

import Analytics from '@segment/analytics.js-core/build/analytics';
// @ts-ignore
import SegmentIntegration from '@segment/analytics.js-integration-segmentio';
const packageJson = require('../../../package.json');
const clientId = `local_cli_${packageJson.version}`;

// @ts-ignore
const segmentAnalytics = new Analytics();

// If the cli-server is reachable, the identity can be established
// The public example can also be run in different contexts without a cli-server
// In which case we fallback to a generic id
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
    return getOrSetAgentFromLocalStorage('public_example_anon_id');
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

  if (appConfig.analytics.segmentToken) {
    segmentAnalytics.use(SegmentIntegration);
    const integrationSettings = {
      'Segment.io': {
        apiKey: appConfig.analytics.segmentToken,
        retryQueue: true,
        addBundledMetadata: true,
      },
    };

    segmentAnalytics.initialize(integrationSettings);
    segmentAnalytics.identify(metadata.clientAgent);
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
  // We could have access to the cli-server here, but not in every case
  // in which case we directly call segement
  if (segmentAnalytics) {
    segmentAnalytics.track(event.name, {
      properties: {
        ...event.properties,
        clientId,
        apiName: metadata.apiName,
        uiVariant: 'publicExample',
      },
    });
  }

  try {
    FullStory.event(event.name, event.properties);
  } catch (e) {}
};
