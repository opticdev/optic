import path from 'path';
import fs from 'fs';
import { SupportedCI } from './constants';

function unexpected(x: never) {
  throw new Error(`received unexpected value ${x}`);
}

export const writeCIAction = (gitRoot: string, ci: SupportedCI) => {
  switch (ci) {
    case 'github-action':
      writeGithubAction(gitRoot);
      return;
    default:
      unexpected(ci);
  }
};

const ghActionContent = `name: Optic

on: [pull_request]

jobs:
  optic-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: optic run
        uses: opticdev/github-action@v1
        with:
          token: \$\{\{ secrets.OPTIC_TOKEN \}\} # You will need to connect up your secret here
          base: \$\{\{ github.event.pull_request.base.ref \}\} # the base git to compare against
`;

export function fileExists(path: string) {
  try {
    fs.statSync(path);
  } catch {
    return false;
  }

  return true;
}

const writeGithubAction = async (gitRoot: string) => {
  const dirPath = path.join(gitRoot, '.github', 'workflows');
  const filePath = path.join(dirPath, 'optic-ci.yml');
  if (fileExists(filePath)) {
    console.error(`Error: a github action file already exists at ${filePath}.`);
    process.exitCode = 1;
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, ghActionContent);
  console.log(`- Github action file written to ${filePath}`);
  console.log('');
  console.log(
    `Set your OPTIC_TOKEN Github secret to finish configuring Optic CI.
More details at: https://github.com/opticdev/github-action/`
  );
};
