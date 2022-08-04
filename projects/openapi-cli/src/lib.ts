import { randomUUID } from 'crypto';
import { initSegment } from './segment';
import { readConfig } from './config';

export * from './workflows';
export { updateByExampleCommand as updateCommand } from './commands/update-by-example';
export { OpenAPIV3 } from './specs';

function initAnalytics(runId: string) {
  const config = readConfig();

  if (config.analytics.segment) {
    initSegment({
      key: config.analytics.segment.key,
      runId,
      version: config.package.version,
      name: config.package.name,
    });
  }
}

initAnalytics(randomUUID()); // @acunniffe made the call on auto-init for now
