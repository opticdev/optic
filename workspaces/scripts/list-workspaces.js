// this script is meant to be run via ` node workspaces/scripts/list-workspaces.js`
const path = require('path');
const fs = require('fs-extra');

async function main() {
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  console.log(workspaces.join(','))
}

main()