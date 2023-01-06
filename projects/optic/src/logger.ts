import log from 'loglevel';

const validLogLevels = new Set([
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'silent',
]);
const logLevel = process.env.LOG_LEVEL;
if (process.env.ENVIRONMENT === 'test') {
  log.setLevel('silent');
} else if (logLevel && validLogLevels.has(logLevel)) {
  log.setLevel(logLevel as any);
} else {
  log.setLevel('info');
}

log.setLevel(log.getLevel()); // Applies the plugin

export const logger = log;
