import { Command, flags } from '@oclif/command';
//@ts-ignore
import gitRev from '../shared/git/git-rev-sync-insourced.js';
import path from 'path';
import fs from 'fs-extra';
import { fromOptic } from '@useoptic/cli-shared';
import { inspect } from 'util';
import colors from 'colors';
import exp from 'constants';
import cli from 'cli-ux';

const hookName = 'pre-commit';
const opticOneLiner =
  '[[ "$(api -v &> /dev/null)" ]] || { api status --pre-commit ; } # API Diff Check';

export default class Status extends Command {
  static description = 'lists any APIs diffs since your last git commit';

  static flags = {
    'exit-code': flags.boolean({ default: false }),
  };

  async run() {
    const { flags } = this.parse(Status);
    const exitCode = flags['exit-code'] || false;

    const results = await checkForHook();

    if (!results.inGit) {
      this.log(fromOptic(colors.yellow(`This API is not in a git repo`)));
      return printCheck();
    } else {
      if (!results.existingPreCommitHookContainsOpticSnippet) {
        this.log(
          `Did you know ${colors.bold(
            'api status'
          )} can run as a pre-commit hook?\n${colors.grey(
            'This makes it easy to handle API Diffs as you check-in your new code.\n'
          )}`
        );
        const confirm = await cli.confirm(
          `Install the ${colors.bold('api status')} pre-commit hook? (yes, no)`
        );
        if (confirm) {
          cli.action.start('installing pre-commit hook...');
          await addHook(results);
          cli.action.stop();
        }

        await printCheck();
      }
    }

    // if (exitCode) {
    //   // this.error('Diff has not been handled');
    //   process.exit(1);
    // }
  }
}

export async function printCheck() {
  console.log('printing check results!!');
}

/// hook check
interface HookCheckResult {
  inGit: boolean;
  preCommitPath?: string;
  hasExistingPreCommitHook: boolean;
  existingPreCommitHookContainsOpticSnippet: boolean;
}
async function checkForHook(): Promise<HookCheckResult> {
  if (gitRev.isInRepo()) {
    const hooksPath = path.join(gitRev.topLevel(), gitRev.hooks());
    const preCommitPath = path.join(hooksPath, hookName);
    const hookFileExists = fs.existsSync(preCommitPath);
    if (hookFileExists) {
      const bashRaw = await fs.readFile(preCommitPath).toString();
      const containsSnippet = bashRaw.includes('api status'); // looser match. they may have done it themselves.
      return {
        inGit: true,
        preCommitPath,
        hasExistingPreCommitHook: true,
        existingPreCommitHookContainsOpticSnippet: containsSnippet,
      };
    } else {
      return {
        inGit: true,
        preCommitPath,
        hasExistingPreCommitHook: false,
        existingPreCommitHookContainsOpticSnippet: false,
      };
    }
  } else {
    return {
      inGit: false,
      hasExistingPreCommitHook: false,
      existingPreCommitHookContainsOpticSnippet: false,
    };
  }
}

async function addHook(result: HookCheckResult) {
  if (result.hasExistingPreCommitHook && result.preCommitPath) {
    const bashRaw = await fs.readFile(result.preCommitPath).toString();
    const newContents = bashRaw + '\n' + opticOneLiner;
    await fs.writeFile(result.preCommitPath, newContents);
    console.log(
      colors.yellow(
        `Appended Optic one-liner to your pre-commit hook. Feel free to move the snippet to anywhere in the script. ${colors.grey(
          result.preCommitPath
        )}`
      )
    );
  } else if (!result.hasExistingPreCommitHook && result.preCommitPath) {
    await fs.writeFile(result.preCommitPath, defaultNewHook);
    await fs.chmod(result.preCommitPath!, fs.constants.S_IRWXU);
    console.log(`pre-commit hook added ${colors.grey(result.preCommitPath)}`);
  }
}

const defaultNewHook = `
#!/bin/sh

${opticOneLiner}

`.trim();
