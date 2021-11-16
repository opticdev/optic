import { uploadCiRun } from "../upload";
import { OpticBackendClient } from "../optic-client";
import { loadFile, uploadFileToS3 } from "../utils";
import { mockGhContext } from "./mock-gh-context";

jest.mock("../optic-client");
jest.mock("../utils");

const MockedOpticBackendClient = OpticBackendClient as jest.MockedClass<
  typeof OpticBackendClient
>;
const mockedLoadFile = loadFile as jest.MockedFunction<typeof loadFile>;
const mockedUploadFileToS3 = uploadFileToS3 as jest.MockedFunction<
  typeof uploadFileToS3
>;

afterEach(() => {
  // Clear all instances and calls to constructor and all methods:
  mockedLoadFile.mockClear();
  mockedUploadFileToS3.mockClear();
  MockedOpticBackendClient.mockClear();
});

test("uploading a file", async () => {
  const mockOpticClient = new MockedOpticBackendClient("", () =>
    Promise.resolve("")
  );
  const contextPath = "/context_path";

  mockedLoadFile.mockImplementation(async (filePath: string) => {
    if (filePath === contextPath) {
      return Buffer.from(JSON.stringify(mockGhContext));
    } else {
      return Buffer.from("abc");
    }
  });

  await uploadCiRun(mockOpticClient, {
    from: "/from_path",
    to: "/to_path",
    context: "/context_path",
  });

  // TODO add in better assertions around API calls when interface is defined
  expect(mockedLoadFile.mock.calls.length).toBe(3);
  expect(mockedUploadFileToS3.mock.calls.length).toBe(3);
  expect(
    (
      mockOpticClient.saveCiRun as jest.MockedFunction<
        typeof mockOpticClient.saveCiRun
      >
    ).mock.calls.length
  ).toBe(1);
});
