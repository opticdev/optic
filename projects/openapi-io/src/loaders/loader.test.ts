import * as path from "path";
import { loadSpecFromFile, loadSpecFromUrl } from "./file";
import { inGit, loadSpecFromBranch } from "./file-on-branch";
import { SpecLoaderResult } from "./types";
import { serialize } from "jest-serializer";
import { ParseOpenAPIResult } from "../parser/openapi-sourcemap-parser";

const cwd = process.cwd();

function prepSnapshot(result: SpecLoaderResult) {
  result.sourcemap?.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];
  });
  // @ts-ignore
  result.sourcemap!.rootFilePath = result.sourcemap?.rootFilePath.split(cwd)[1];
  return result;
}

it("can parse an OpenAPI spec with external references", async () => {
  const results = await loadSpecFromFile(
    path.join(
      __dirname,
      "../../inputs/openapi3-with-references/external-multiple.yaml"
    ),
    false
  );
  expect(prepSnapshot(results)).toMatchSnapshot();
});

it("can parse an OpenAPI spec repo branches", async () => {
  const gitRepo = await inGit(
    path.resolve(__dirname, "../../inputs/git-repo/petstore0.json")
  );
  if (gitRepo) {
    const onFeature = await loadSpecFromBranch(
      "petstore0.json",
      gitRepo,
      "feature/1",
      {},
      false
    );
    expect(prepSnapshot(onFeature)).toMatchSnapshot();
    const onMain = await loadSpecFromBranch(
      "petstore0.json",
      gitRepo,
      "main",
      {},
      false
    );
    expect(prepSnapshot(onMain)).toMatchSnapshot();
  }
});

it("can parse an OpenAPI spec with references in repo branches", async () => {
  const gitRepo = await inGit(
    path.resolve(__dirname, "../../inputs/git-repo/external-multiple.yaml")
  );
  if (gitRepo) {
    const onFeature = await loadSpecFromBranch(
      "external-multiple.yaml",
      gitRepo,
      "feature/1",
      {},
      false
    );
    expect(prepSnapshot(onFeature)).toMatchSnapshot();
    const onMain = await loadSpecFromBranch(
      "external-multiple.yaml",
      gitRepo,
      "main",
      {},
      false
    );
    expect(prepSnapshot(onMain)).toMatchSnapshot();
  }
});
