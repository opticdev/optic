import { OpticBackendClient } from '../../clients/optic-client';

const MAX_ALLOWABLE_FAILURES = 3;

export async function waitForSession(
  client: OpticBackendClient,
  sessionId: string,
  timeout: number,
  defaultPollingWaitTime: number = 5
): Promise<null> {
  let consecutiveFailures = 0;
  let pollingWaitTime = defaultPollingWaitTime;
  // timeout in 5 minutes for now
  const timeoutEnd = new Date(new Date().getTime() + timeout);

  while (new Date() < timeoutEnd) {
    try {
      const {
        status,
        metadata: {
          polling_wait_time, // in seconds
        },
      } = await client.getSessionStatus(sessionId);
      pollingWaitTime = polling_wait_time;
      consecutiveFailures = 0;
      if (status === 'completed') {
        return null;
      }
      // TODO handle status === 'error'
    } catch (e) {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_ALLOWABLE_FAILURES) {
        throw e;
      }
    }

    await sleep(pollingWaitTime * 1000);
  }

  throw new Error('Timed out waiting for execution to complete');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
