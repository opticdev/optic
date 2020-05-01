// this script is meant to be run via `yarn bump <whatever version>`
const path = require('path');
const fs = require('fs-extra');

async function main(targetVersion) {
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  console.log(`setting workspace versions to ${targetVersion}`);
  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        targetPackage.version = targetVersion;
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
  const packageNames = results.map((result) => result.package.name);
  console.log(packageNames.map((x) => ` - ${x}\n`).join(''));
  const updateVersionTasks = results.map((result) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        packageNames.map((packageName) => {
          if (result.package.dependencies[packageName]) {
            result.package.dependencies[packageName] = targetVersion;
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
  await Promise.all(updateVersionTasks);
  console.log(`Done!`);
}

const [, , targetVersion] = process.argv;
main(targetVersion);
