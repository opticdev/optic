// this script is meant to be run via ` node workspaces/scripts/list-workspace-packages.js`
const path = require('path');
const fs = require('fs-extra');

async function main() {
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        resolve(targetPackage.name.substring('@useoptic/'.length));
      } catch (e) {
        reject(e)
      }
    })
    return task;
  });
  
  const packages = await Promise.all(tasks)
  console.log(packages.join(','))
}

main()