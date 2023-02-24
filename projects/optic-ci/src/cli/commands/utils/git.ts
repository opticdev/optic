const util = require('util');
const exec = util.promisify(require('child_process').exec);
export async function inGit(workingDirectory: string): Promise<false | string> {
  try {
    const { stdout } = await exec('git rev-parse --show-toplevel', {
      cwd: workingDirectory,
    });
    return stdout.trim();
  } catch (e) {
    return false;
  }
}
