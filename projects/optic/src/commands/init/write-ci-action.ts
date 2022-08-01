import path from 'path';
import fs from 'fs';
import { supportedCIs } from './constants';

function unexpected(x: never) {
  throw new Error(`received unexpected value ${x}`);
}

export const writeCIAction = (
  gitRoot: string,
  ci: typeof supportedCIs[number]
) => {
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
`;

const writeGithubAction = (gitRoot: string) => {
  const dirPath = path.join(gitRoot, '.github', 'workflows');
  const filePath = path.join(dirPath, 'optic-ci.yml');
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, ghActionContent);
  console.log(`Github action file written to ${filePath}`);
  console.log(`Dont forget to set your OPTIC_TOKEN Github secret.`);
};
