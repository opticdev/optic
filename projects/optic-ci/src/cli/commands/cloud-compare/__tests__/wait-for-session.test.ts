import { waitForSession } from '../wait-for-session';
import { OpticBackendClient } from '../../../clients/optic-client';

jest.mock('../../../clients/optic-client');

let MockedOpticBackendClient: jest.MockedClass<typeof OpticBackendClient>;
let client: OpticBackendClient;
let mockGetSessionStatus: jest.MockedFunction<
  OpticBackendClient['getSessionStatus']
>;

describe('waitForSession', () => {
  beforeEach(() => {
    MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
      typeof OpticBackendClient
    >;

    client = new MockedOpticBackendClient('', async () => '');
    mockGetSessionStatus = client.getSessionStatus as jest.MockedFunction<
      typeof client.getSessionStatus
    >;
  });

  afterEach(() => {
    MockedOpticBackendClient.mockClear();
    mockGetSessionStatus.mockClear();
  });

  test('should time out', async () => {
    mockGetSessionStatus.mockReturnValue(
      Promise.resolve({
        status: 'started',
        metadata: {
          polling_wait_time: 0.01,
        },
      })
    );

    await expect(async () => {
      await waitForSession(client, 'sessionId', 200);
    }).rejects.toThrow('Timed out waiting for execution to complete');
  });

  test('should wait for success result', async () => {
    mockGetSessionStatus
      .mockReturnValueOnce(
        Promise.resolve({
          status: 'started',
          metadata: {
            polling_wait_time: 0.01,
          },
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          status: 'completed',
          metadata: {
            polling_wait_time: 0.01,
          },
        })
      );

    const result = await waitForSession(client, 'sessionId', 200);

    expect(mockGetSessionStatus).toHaveBeenCalledTimes(2);
    expect(result).toEqual(null);
  });
});
