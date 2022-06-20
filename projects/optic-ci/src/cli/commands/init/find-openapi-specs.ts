import util from 'node:util';
import { exec } from 'child_process';
const exec_p = util.promisify(exec);

export const findOpenAPISpecs = async () => {
  const command = `git grep --untracked --name-only 'openapi.*3' -- '*.yml' '*.json'`;
  const res = await exec_p(command);
  if (res.stderr) throw new Error(res.stderr);
  return res.stdout.trim().split('\n');
};
