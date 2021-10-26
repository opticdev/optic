import {SpecLoaderResult} from "./types";
import * as path from "path";
import tap from "tap";
import {parseOpenAPIFromRepoWithSourcemap} from "../parser/openapi-sourcemap-parser";
const util = require('util');
const exec = util.promisify(require('child_process').exec);


export async function loadSpecFromBranch(fileNameInRepo: string, repoPath: string, branch: string, defaultValue: any): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIFromRepoWithSourcemap(fileNameInRepo, repoPath, branch)
    return {success: true, flattened: results.jsonLike, sourcemap: results.sourcemap}
  } catch (e: any) {
    return {success: false, error: e.message}
  }
}


tap.test("can parse an OpenAPI spec repo branches", async () => {
  const gitRepo = await inGit(path.resolve(__dirname, "../../inputs/git-repo/petstore0.json"))
  if (gitRepo) {
    const onFeature = await loadSpecFromBranch("petstore0.json", gitRepo, "feature/1", {})
    tap.matchSnapshot(onFeature)
    const onMain = await loadSpecFromBranch("petstore0.json", gitRepo, "main", {})
    tap.matchSnapshot(onMain)
  }
});

tap.test("can parse an OpenAPI spec with references in repo branches", async () => {
  const gitRepo = await inGit(path.resolve(__dirname, "../../inputs/git-repo/external-multiple.yaml"))
  console.log(gitRepo)
  if (gitRepo) {
    const onFeature = await loadSpecFromBranch("external-multiple.yaml", gitRepo, "feature/1", {})
    tap.matchSnapshot(onFeature)
    const onMain = await loadSpecFromBranch("external-multiple.yaml", gitRepo, "main", {})
    tap.matchSnapshot(onMain)
  }
});

// helpers


export async function inGit(filename: string): Promise<false | string> {
  try {
    const parent = path.dirname(filename)
    await exec(`git ls-files --error-unmatch ${filename}`, {cwd: parent})
    const {stdout} = await exec('git rev-parse --show-toplevel', {cwd: parent})
    return stdout.trim()
  } catch(e) {
    return false
  }
}
