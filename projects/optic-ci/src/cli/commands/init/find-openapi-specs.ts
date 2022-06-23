import util from 'node:util';
import { exec } from 'child_process';
import path from 'path';
const exec_p = util.promisify(exec);

export const findOpenAPISpecs = async () => {
  // We search for yml or json files with a line containing either `openapi: ` (yml)
  // or `openapi": ` (json), followed by a `3`.
  // The file paths are resolved from the git root.
  const command = `git grep --untracked --name-only -E 'openapi(:\\ |":\\ ).*3' -- \
$(git rev-parse --show-toplevel)/'*.yml' \
$(git rev-parse --show-toplevel)/'*.yaml' \
$(git rev-parse --show-toplevel)/'*.json'`;
  const res = await exec_p(command);
  if (res.stderr) throw new Error(res.stderr);
  const relativePaths = res.stdout.trim().split('\n');
  const cwd = process.cwd();
  return relativePaths.map((p) => path.join(cwd, p));
};
