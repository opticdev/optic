/*
  Forwards events to the event bus running on cli-server
 */
import { IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import { Client } from '@useoptic/cli-client';
import { TrackingEventBase } from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from './paths';
import { Config } from '../config';

export async function trackUserEvent(
  apiName: string,
  event: TrackingEventBase<any>
) {
  const daemonState = await ensureDaemonStarted(
    lockFilePath,
    Config.apiBaseUrl
  );

  const cliServerClient = new Client(
    `http://localhost:${daemonState.port}/api`
  );

  await cliServerClient.postTrackingEventsWithApi(apiName, [event]);
}

export function opticTaskToProps(
  task: string,
  config: IOpticTaskRunnerConfig
): any {
  if (config) {
    return {
      task,
      command: config.command,
      'serviceConfig.port': config.serviceConfig.port,
      'serviceConfig.host': config.serviceConfig.host,
      'serviceConfig.protocol': config.serviceConfig.protocol,
      'serviceConfig.basePath': config.serviceConfig.basePath,
      'proxyConfig.port': config.proxyConfig.port,
      'proxyConfig.host': config.proxyConfig.host,
      'proxyConfig.protocol': config.proxyConfig.protocol,
      'proxyConfig.basePath': config.proxyConfig.basePath,
    };
  } else {
    return { task };
  }
}
