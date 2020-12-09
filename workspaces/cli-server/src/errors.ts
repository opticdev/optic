import * as Sentry from '@sentry/node';
import Os from 'os';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';

export function trackWithSentry({
  dsn,
  serverName,
  environment,
  release,
}: {
  dsn: string | undefined;
  serverName: string;
  environment: string;
  release: string;
}) {
  if (!dsn)
    throw new Error(`Sentry DSN must be set to track errors for ${serverName}`);

  Sentry.init({
    dsn,
    serverName,
    environment,
    release,
    tracesSampleRate: 1.0,
  });

  const nodeVersion = process.version;
  const hostArch = process.arch;
  const hostPlatform = process.platform;
  const hostCpuCount = Os.cpus().length.toString();
  const hostMemorySize = Os.totalmem().toString();

  Sentry.setTags({
    nodeVersion,
    hostArch,
    hostPlatform,
    hostCpuCount,
    hostMemorySize,
  });

  getOrCreateAnonId().then((id: string) => {
    Sentry.setUser({
      id,
    });
  });
}
