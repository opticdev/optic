import { initSegment } from './segment';
import { readConfig } from './config';

export * from './workflows';
export { updateCommand } from './commands/update';
export { OpenAPIV3 } from './specs';

function initAnalytics() {
  const config = readConfig();

  if (config.analytics.segment) {
    initSegment({ key: config.analytics.segment.key });
  }
}

initAnalytics(); // @acunniffe made the call on auto-init for now
