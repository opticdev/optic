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

export const getMetadata: (
  apiNameFetcher: () => Promise<string>
) => AnalyticsStoreProps['getMetadata'] = (apiNameFetcher) => async () => {
  const apiName = await apiNameFetcher();

  return {
    clientId,
    clientAgent: getOrSetAgentFromLocalStorage('cloud_viewer_anon_id'),
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
  if (segmentAnalytics) {
    segmentAnalytics.track(event.name, {
      properties: {
        ...event.properties,
        clientId,
        apiName: metadata.apiName,
        uiVariant: 'cloudViewer',
      },
    });
  }

  try {
    FullStory.event(event.name, event.properties);
  } catch (e) {}
};
