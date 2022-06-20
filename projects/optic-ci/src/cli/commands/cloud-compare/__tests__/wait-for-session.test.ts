import { SessionStatus } from '../../../clients/optic-client';
import { waitForSession } from '../wait-for-session';
import { OpticBackendClient } from '../../../clients/optic-client';

jest.mock('../../../clients/optic-client');

const MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
  typeof OpticBackendClient
>;

const client = new MockedOpticBackendClient('', async () => '');
const mockGetSession = client.getSession as jest.MockedFunction<
  typeof client.getSession
>;

describe('waitForSession', () => {
  const getSessionDefaults = {
    web_url: 'https://example.com/session',
    session: {
      owner: '',
      repo: '',
      commit_hash: '',
      pull_request: 0,
      run: 0,
      branch_name: '',
      from_arg: '',
      to_arg: '',
    },
    files: [],
  };

  afterEach(() => {
    MockedOpticBackendClient.mockClear();
    mockGetSession.mockClear();
  });

  test('should time out', async () => {
    mockGetSession.mockReturnValue(
      Promise.resolve({
        ...getSessionDefaults,
        status: SessionStatus.NotReady,
      })
    );

    expect(async () => {
      await waitForSession(client, 'sessionId', 5, 1);
    }).toThrow('Timed out waiting for execution to complete');
  });

  test('should wait for success result', async () => {
    mockGetSession
      .mockReturnValueOnce(
        Promise.resolve({
          ...getSessionDefaults,
          status: SessionStatus.NotReady,
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          ...getSessionDefaults,
          status: SessionStatus.Ready,
        })
      );

    const result = await waitForSession(client, 'sessionId', 5, 1);

    expect(mockGetSession).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ...getSessionDefaults,
      status: SessionStatus.Ready,
    });
  });
});
