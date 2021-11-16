import { parseSpecVersion } from "./compare-input-parser";

it("can parse a file ", async () => {
  expect(parseSpecVersion("/path/to/spec.json")).toMatchSnapshot();
});

it("can parse a git rev-file ", async () => {
  expect(parseSpecVersion("main:/path/to/spec.json")).toMatchSnapshot();
  expect(parseSpecVersion("feature/1:spec.json")).toMatchSnapshot();
  expect(
    parseSpecVersion("feature/1/define-spc:path/to/spec.json")
  ).toMatchSnapshot();
});
