// this script is meant to be run via `yarn run alias-for-github`
const path = require('path');
const fs = require('fs-extra');

const newScope = '@useoptic-development-channel/';

async function main() {
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  console.log(`setting package scope to ${newScope}`);
  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        targetPackage.oldName = targetPackage.name;
        targetPackage.name = targetPackage.name.replace('@useoptic/', newScope);
        resolve({
          workspace,
          package: targetPackage,
        });
      } catch (e) {
        reject(e);
      }
    });
    return task;
  });
  const results = await Promise.all(tasks);
  const packageNames = results.map((result) => {
    const oldName = result.package.oldName;
    delete result.package.oldName;

    return {
      oldName,
      newName: result.package.name,
    };
  });
  console.log(packageNames.map((x) => ` - ${x}\n`).join(''));
  const updateDependenciesTask = results.map((result) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        packageNames.map(({ oldName, newName }) => {
          if (result.package.dependencies[oldName]) {
            const targetVersion = result.package.dependencies[oldName];
            delete result.package.dependencies[oldName];
            result.package.dependencies[newName] = targetVersion;
          }
        });
        await fs.writeJson(
          `./${result.workspace}/package.json`,
          result.package,
          { spaces: 2 }
        );
      } catch (e) {
        reject(e);
      }
    });
    return task;
  });
  await Promise.all(updateDependenciesTask);
  console.log(`Done!`);
}

const [, ,] = process.argv;
main();
