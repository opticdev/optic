import { randomUUID } from 'crypto';
import { initSegment } from './segment';
import { readConfig } from './config';

export * from './workflows';
export { updateByExampleCommand as updateCommand } from './commands/update-by-example';
export { OpenAPIV3 } from './specs';

function initAnalytics(runId: string) {
  const config = readConfig();
  const packageJson = require('../package.json');

  if (config.analytics.segment) {
    initSegment({
      key: config.analytics.segment.key,
      runId,
      version: packageJson.version,
      name: packageJson.name,
    });
  }
}

initAnalytics(randomUUID()); // @acunniffe made the call on auto-init for now
