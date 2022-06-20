import {
  GetSessionResponse,
  OpticBackendClient,
  SessionStatus,
} from '../../clients/optic-client';

export async function waitForSession(
  client: OpticBackendClient,
  sessionId: string,
  timeout: number,
  pollInterval: number
): Promise<GetSessionResponse> {
  // timeout in 5 minutes for now
  const timeoutEnd = new Date(new Date().getTime() + timeout);

  while (new Date() < timeoutEnd) {
    const session = await client.getSession(sessionId);
    if (session.status === SessionStatus.Ready) {
      return session;
    }

    await sleep(pollInterval);
  }

  throw new Error('Timed out waiting for execution to complete');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
