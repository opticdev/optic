import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';

import { v4 as uuidv4 } from 'uuid';

import { uploadCiRun } from '../upload';
import {
  OpticBackendClient,
  SessionStatus,
  UploadSlot,
} from '../../../clients/optic-client';
import { mockGhContext } from '../../utils/__tests__/mock-context';
import { uploadFileToS3 } from '../../utils/s3';
import {
  defaultEmptySpec,
  NormalizedCiContext,
} from '@useoptic/openapi-utilities';

jest.mock('../../../clients/optic-client');
jest.mock('../../utils/files');
jest.mock('../../utils/s3');

const MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
  typeof OpticBackendClient
>;
const mockOpticClient = new MockedOpticBackendClient('', () =>
  Promise.resolve('')
);
const mockedStartSession = mockOpticClient.createSession as jest.MockedFunction<
  typeof mockOpticClient.createSession
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
const mockedUploadFileToS3 = uploadFileToS3 as jest.MockedFunction<
  typeof uploadFileToS3
>;

const compareOutput = {
  results: [],
  changes: [
    {
      changeType: 'added' as any,
      added: {} as any,
    } as any,
  ],
};
const normalizeCiContext: NormalizedCiContext = {
  organization: '',
  repo: '',
  pull_request: 1,
  run: 1,
  commit_hash: '',
  branch_name: '',
  user: null,
};

let fileBufferMap: Record<string, Buffer> = {
  [UploadSlot.CheckResults]: Buffer.from(JSON.stringify(compareOutput)),
  [UploadSlot.FromFile]: Buffer.from(JSON.stringify(defaultEmptySpec)),
  [UploadSlot.ToFile]: Buffer.from(JSON.stringify(defaultEmptySpec)),
  githubContext: Buffer.from(JSON.stringify(mockGhContext)),
};

beforeEach(() => {
  mockGetSession.mockReturnValue(
    Promise.resolve({
      web_url: '/the_web_url',
      session: {
        owner: '',
        repo: '',
        pull_request: 1,
        run: 1,
        commit_hash: '',
        branch_name: '',
        from_arg: '',
        to_arg: '',
      },
      status: SessionStatus.Ready,
      files: [],
    }) as any
  );
});

afterEach(() => {
  // Clear all instances and calls to constructor and all methods:
  mockedUploadFileToS3.mockClear();
  MockedOpticBackendClient.mockClear();
  mockedStartSession.mockClear();
  mockGetUploadUrls.mockClear();
  mockMarkUploadAsComplete.mockClear();
  mockGetSession.mockClear();
});

test('uploading a file', async () => {
  const numberOfFiles = 3;
  const githubUploadSlots = [
    UploadSlot.FromFile,
    UploadSlot.ToFile,
    UploadSlot.CheckResults,
  ];

  mockGetUploadUrls.mockImplementation(async () => {
    return githubUploadSlots.map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  await uploadCiRun(
    compareOutput,
    defaultEmptySpec,
    defaultEmptySpec,
    mockOpticClient,
    {
      from: UploadSlot.FromFile,
      to: UploadSlot.ToFile,
    },
    normalizeCiContext
  );

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

  await uploadCiRun(
    compareOutput,
    defaultEmptySpec,
    defaultEmptySpec,
    mockOpticClient,
    {
      from: UploadSlot.FromFile,
      to: UploadSlot.ToFile,
    },
    normalizeCiContext
  );

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
  const numberOfFiles = 3;

  mockGetUploadUrls.mockImplementation(async () => {
    return [
      UploadSlot.FromFile,
      UploadSlot.ToFile,
      UploadSlot.CheckResults,
    ].map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  await uploadCiRun(
    compareOutput,
    defaultEmptySpec,
    defaultEmptySpec,
    mockOpticClient,
    {
      to: UploadSlot.ToFile,
    },
    normalizeCiContext
  );

  expect(mockedStartSession.mock.calls.length).toBe(1);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(numberOfFiles);
  for (const uploadSlot of [UploadSlot.ToFile, UploadSlot.CheckResults]) {
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
