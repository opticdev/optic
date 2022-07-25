import util from 'node:util';
import { exec } from 'child_process';
import path from 'path';
const exec_p = util.promisify(exec);

export const findOpenAPISpecs = async () => {
  // We search for yml or json files with a line containing either `openapi: ` (yml)
  // or `openapi": ` (json), followed by a `3`.
  // The file paths are resolved from the git root.
  // `|| true` prevents the command to fail when no file is found.
  const command = `toplevel=$(git rev-parse --show-toplevel) && \
git grep --untracked --name-only -E 'openapi(:\\ |":\\ ).*3' -- \
$toplevel/'*.yml' \
$toplevel/'*.yaml' \
$toplevel/'*.json' \
|| true`;
  const res = await exec_p(command);
  if (res.stderr) throw new Error(res.stderr);
  const relativePaths = res.stdout
    .trim()
    .split('\n')
    .filter((path) => !!path);
  const cwd = process.cwd();
  return relativePaths.map((p) => path.join(cwd, p));
};
