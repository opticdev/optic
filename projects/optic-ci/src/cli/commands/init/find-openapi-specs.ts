import util from 'node:util';
import { exec } from 'child_process';
const exec_p = util.promisify(exec);

export const findOpenAPISpecs = async () => {
  // We search for yml or json files with a line containing "openapi" followed by a "3".
  const command = `git grep --untracked --name-only 'openapi.*3' -- '*.yml' '*.json' '*.yaml'`;
  const res = await exec_p(command);
  if (res.stderr) throw new Error(res.stderr);
  return res.stdout.trim().split('\n');
};
