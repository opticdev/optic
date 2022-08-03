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

const originalMethodFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  var rawMethod = originalMethodFactory(methodName, logLevel, loggerName);

  return function (message) {
    rawMethod(typeof message === 'object' ? JSON.stringify(message) : message);
  };
};
log.setLevel(log.getLevel()); // Applies the plugin

export const logger = log;
