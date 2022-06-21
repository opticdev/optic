import { OpticBackendClient } from '../../clients/optic-client';

export async function waitForSession(
  client: OpticBackendClient,
  sessionId: string,
  timeout: number
): Promise<null> {
  // timeout in 5 minutes for now
  const timeoutEnd = new Date(new Date().getTime() + timeout);

  while (new Date() < timeoutEnd) {
    const {
      status,
      metadata: {
        polling_wait_time, // in seconds
      },
    } = await client.getSessionStatus(sessionId);
    if (status === 'completed') {
      return null;
    }

    await sleep(polling_wait_time * 1000);
  }

  throw new Error('Timed out waiting for execution to complete');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
