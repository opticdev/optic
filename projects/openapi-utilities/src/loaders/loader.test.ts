import * as path from "path";
import tap from "tap";
import {loadSpecFromFile, loadSpecFromUrl} from "./file";
import { inGit, loadSpecFromBranch } from "./file-on-branch";

tap.test("can parse an OpenAPI spec with external references", async () => {
  const results = await loadSpecFromFile(
    path.join(__dirname, "../../inputs/openapi3-with-references/external-multiple.yaml")
  )
  tap.matchSnapshot(results);
});

tap.test("can parse an OpenAPI spec repo branches", async () => {
  const gitRepo = await inGit(
    path.resolve(__dirname, "../../inputs/git-repo/petstore0.json")
  );
  if (gitRepo) {
    const onFeature = await loadSpecFromBranch(
      "petstore0.json",
      gitRepo,
      "feature/1",
      {}
    );
    tap.matchSnapshot(onFeature);
    const onMain = await loadSpecFromBranch(
      "petstore0.json",
      gitRepo,
      "main",
      {}
    );
    tap.matchSnapshot(onMain);
  }
});

tap.test(
  "can parse an OpenAPI spec with references in repo branches",
  async () => {
    const gitRepo = await inGit(
      path.resolve(__dirname, "../../inputs/git-repo/external-multiple.yaml")
    );
    if (gitRepo) {
      const onFeature = await loadSpecFromBranch(
        "external-multiple.yaml",
        gitRepo,
        "feature/1",
        {}
      );
      tap.matchSnapshot(onFeature);
      const onMain = await loadSpecFromBranch(
        "external-multiple.yaml",
        gitRepo,
        "main",
        {}
      );
      tap.matchSnapshot(onMain);
    }
  }
);
