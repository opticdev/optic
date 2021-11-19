import { v4 as uuidv4 } from "uuid";

import { uploadCiRun } from "../upload";
import { OpticBackendClient, UploadSlot } from "../optic-client";
import { loadFile, uploadFileToS3 } from "../utils";
import { mockGhContext } from "./mock-gh-context";

jest.mock("../optic-client");
jest.mock("../utils");

const MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
  typeof OpticBackendClient
>;
const mockOpticClient = new MockedOpticBackendClient("", () =>
  Promise.resolve("")
);
const mockedStartSession = mockOpticClient.startSession as jest.MockedFunction<
  typeof mockOpticClient.startSession
>;
const mockGetUploadUrls = mockOpticClient.getUploadUrls as jest.MockedFunction<
  typeof mockOpticClient.getUploadUrls
>;
const mockMarkUploadAsComplete = mockOpticClient.markUploadAsComplete as  jest.MockedFunction<
typeof mockOpticClient.markUploadAsComplete
>;
const mockedLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;
const mockedUploadFileToS3 = uploadFileToS3 as jest.MockedFunction<
  typeof uploadFileToS3
>;

let fileBufferMap: Record<UploadSlot, Buffer> = {
  [UploadSlot.CheckResults]: Buffer.from("check results"),
  [UploadSlot.FromFile]: Buffer.from("from file"),
  [UploadSlot.ToFile]: Buffer.from("to file"),
  [UploadSlot.GithubActionsEvent]: Buffer.from(JSON.stringify(mockGhContext)),
};

afterEach(() => {
  // Clear all instances and calls to constructor and all methods:
  mockedLoadFile.mockClear();
  mockedUploadFileToS3.mockClear();
  MockedOpticBackendClient.mockClear();
  mockedStartSession.mockClear();
  mockGetUploadUrls.mockClear();
  mockMarkUploadAsComplete.mockClear();
});

test("uploading a file", async () => {
  const numberOfFiles = Object.values(UploadSlot).length;

  mockGetUploadUrls.mockImplementation(async () => {
    return Object.values(UploadSlot).map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  mockedLoadFile.mockImplementation(async (filePath: string) => {
    return fileBufferMap[filePath as UploadSlot] || Buffer.from("abc");
  });

  await uploadCiRun(mockOpticClient, {
    from: UploadSlot.FromFile,
    to: UploadSlot.ToFile,
    context: UploadSlot.GithubActionsEvent,
    rules: UploadSlot.CheckResults,
  });

  expect(mockedLoadFile.mock.calls.length).toBe(numberOfFiles);
  expect(mockedStartSession.mock.calls.length).toBe(1);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(numberOfFiles);
  for (const uploadSlot of Object.values(UploadSlot)) {
    const matchingFnCall = mockedUploadFileToS3.mock.calls.find(
      (call) => call[0] === `/url/${uploadSlot}`
    )!;
    expect(matchingFnCall[1].toString()).toEqual(
      fileBufferMap[uploadSlot].toString()
    );
  }
  expect(mockMarkUploadAsComplete.mock.calls.length).toBe(numberOfFiles);
});

test("uploading a file with only partial slots open", async () => {
  const returnedSlots = [UploadSlot.CheckResults, UploadSlot.FromFile];

  mockGetUploadUrls.mockImplementation(async () => {
    return returnedSlots.map((uploadSlot) => ({
      id: uuidv4(),
      slot: uploadSlot,
      url: `/url/${uploadSlot}`,
    }));
  });

  mockedLoadFile.mockImplementation(async (filePath: string) => {
    return fileBufferMap[filePath as UploadSlot] || Buffer.from("abc");
  });

  await uploadCiRun(mockOpticClient, {
    from: UploadSlot.FromFile,
    to: UploadSlot.ToFile,
    context: UploadSlot.GithubActionsEvent,
    rules: UploadSlot.CheckResults,
  });

  expect(mockedLoadFile.mock.calls.length).toBe(Object.values(UploadSlot).length);
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
});
