import { v4 as uuidv4 } from 'uuid';

import { uploadCiRun } from '../upload';
import {
  OpticBackendClient,
  SessionType,
  SessionStatus,
  UploadSlot,
} from '../optic-client';
import { loadFile, uploadFileToS3 } from '../../utils';
import { mockGhContext } from './mock-context';

jest.mock('../optic-client');
jest.mock('../../utils');

const MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
  typeof OpticBackendClient
>;
const mockOpticClient = new MockedOpticBackendClient('', () =>
  Promise.resolve('')
);
const mockedStartSession = mockOpticClient.startSession as jest.MockedFunction<
  typeof mockOpticClient.startSession
>;
const mockGetUploadUrls = mockOpticClient.getUploadUrls as jest.MockedFunction<
  typeof mockOpticClient.getUploadUrls
>;
const mockMarkUploadAsComplete =
  mockOpticClient.markUploadAsComplete as jest.MockedFunction<
    typeof mockOpticClient.markUploadAsComplete
  >;
const mockGetSession = mockOpticClient.getSession as jest.MockedFunction<
  typeof mockOpticClient.getSession
>;
const mockedLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;
const mockedUploadFileToS3 = uploadFileToS3 as jest.MockedFunction<
  typeof uploadFileToS3
>;

let fileBufferMap: Record<UploadSlot, Buffer> = {
  [UploadSlot.CheckResults]: Buffer.from('check results'),
  [UploadSlot.FromFile]: Buffer.from('from file'),
  [UploadSlot.ToFile]: Buffer.from('to file'),
  [UploadSlot.GithubActionsEvent]: Buffer.from(JSON.stringify(mockGhContext)),
  [UploadSlot.CircleCiEvent]: Buffer.from(JSON.stringify(mockGhContext)),
};

beforeEach(() => {
  mockedLoadFile.mockImplementation(async (filePath: string) => {
    return fileBufferMap[filePath as UploadSlot] || Buffer.from('abc');
  });

  mockGetSession.mockReturnValue(
    Promise.resolve({
      web_url: '/the_web_url',
      session: {
        type: SessionType.GithubActions,
        run_args: {
          from: '',
          to: '',
          provider: 'github',
          context: '',
          rules: '',
        },
        github_data: {
          organization: '',
          repo: '',
          pull_request: 1,
          run: 1,
          commit_hash: '',
        },
      },
      status: SessionStatus.Ready,
      files: [],
    })
  );
});

afterEach(() => {
  // Clear all instances and calls to constructor and all methods:
  mockedLoadFile.mockClear();
  mockedUploadFileToS3.mockClear();
  MockedOpticBackendClient.mockClear();
  mockedStartSession.mockClear();
  mockGetUploadUrls.mockClear();
  mockMarkUploadAsComplete.mockClear();
  mockGetSession.mockClear();
});

test('uploading a file', async () => {
  const numberOfFiles = 4;
  const githubUploadSlots = [
    UploadSlot.FromFile,
    UploadSlot.ToFile,
    UploadSlot.CheckResults,
    UploadSlot.GithubActionsEvent,
  ]

  mockGetUploadUrls.mockImplementation(async () => {
    return githubUploadSlots.map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  await uploadCiRun(mockOpticClient, {
    from: UploadSlot.FromFile,
    to: UploadSlot.ToFile,
    context: UploadSlot.GithubActionsEvent,
    provider: 'github',
    rules: UploadSlot.CheckResults,
  });

  expect(mockedLoadFile.mock.calls.length).toBe(numberOfFiles);
  expect(mockedStartSession.mock.calls.length).toBe(1);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(numberOfFiles);
  for (const uploadSlot of githubUploadSlots) {
    const matchingFnCall = mockedUploadFileToS3.mock.calls.find(
      (call) => call[0] === `/url/${uploadSlot}`
    )!;
    expect(matchingFnCall[1].toString()).toEqual(
      fileBufferMap[uploadSlot].toString()
    );
  }
  expect(mockMarkUploadAsComplete.mock.calls.length).toBe(numberOfFiles);
  expect(mockGetSession.mock.calls.length).toBe(1);
});

test('uploading a file with only partial slots open', async () => {
  const returnedSlots = [UploadSlot.CheckResults, UploadSlot.FromFile];

  mockGetUploadUrls.mockImplementation(async () => {
    return returnedSlots.map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  await uploadCiRun(mockOpticClient, {
    from: UploadSlot.FromFile,
    to: UploadSlot.ToFile,
    context: UploadSlot.GithubActionsEvent,
    provider: 'github',
    rules: UploadSlot.CheckResults,
  });

  expect(mockedLoadFile.mock.calls.length).toBe(4);
  expect(mockedStartSession.mock.calls.length).toBe(1);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(returnedSlots.length);
  for (const uploadSlot of returnedSlots) {
    const matchingFnCall = mockedUploadFileToS3.mock.calls.find(
      (call) => call[0] === `/url/${uploadSlot}`
    )!;
    expect(matchingFnCall[1].toString()).toEqual(
      fileBufferMap[uploadSlot].toString()
    );
  }
  expect(mockMarkUploadAsComplete.mock.calls.length).toBe(returnedSlots.length);
  expect(mockGetSession.mock.calls.length).toBe(1);
});

test('uploads files where from is not specified', async () => {
  const numberOfFiles = 4;

  mockGetUploadUrls.mockImplementation(async () => {
    return [
      UploadSlot.FromFile,
      UploadSlot.ToFile,
      UploadSlot.CheckResults,
      UploadSlot.GithubActionsEvent,
    ].map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  await uploadCiRun(mockOpticClient, {
    to: UploadSlot.ToFile,
    context: UploadSlot.GithubActionsEvent,
    provider: 'github',
    rules: UploadSlot.CheckResults,
  });

  expect(mockedLoadFile.mock.calls.length).toBe(numberOfFiles - 1);
  expect(mockedStartSession.mock.calls.length).toBe(1);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(numberOfFiles);
  for (const uploadSlot of [
    UploadSlot.ToFile,
    UploadSlot.GithubActionsEvent,
    UploadSlot.CheckResults,
  ]) {
    const matchingFnCall = mockedUploadFileToS3.mock.calls.find(
      (call) => call[0] === `/url/${uploadSlot}`
    )!;
    expect(matchingFnCall[1].toString()).toEqual(
      fileBufferMap[uploadSlot].toString()
    );
  }
  expect(mockMarkUploadAsComplete.mock.calls.length).toBe(numberOfFiles);
  expect(mockGetSession.mock.calls.length).toBe(1);
});
