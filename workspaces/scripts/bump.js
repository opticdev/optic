// this script is meant to be run via `yarn bump <whatever version>`
const path = require('path');
const fs = require('fs-extra');

async function main(targetVersion) {
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  if ([undefined, "minor", "major", "patch"].includes(targetVersion)) {
    bumpAllPackages(targetVersion);
    return;
  } else {
    console.log(`setting workspace versions to ${targetVersion}`);
    return
  }

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

// this is called if there is no specified target version
async function bumpAllPackages(type = "patch") {
  console.log(`performing a ${type} bump`)
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  const versions = {}

  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        const old = targetPackage.version;

        targetPackage.version = bumpVersion(targetPackage.version, type);
        console.log(`bumping ${old} to ${targetPackage.version}`)
        versions[targetPackage.name] = targetPackage.version;

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
            console.log(`changing ${packageName} to be ${versions[packageName]}`)
            result.package.dependencies[packageName] = versions[packageName];
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

function bumpVersion(current, type) {
  console.log(current)
  let [major, minor, patch] = current.split(".");
  switch (type) {
    case "major":
      major = parseInt(major) + 1;
      minor = patch = 0;
      break;
      case "minor":
        minor = parseInt(minor) + 1;
        patch = 0;
        break;
      case "patch":
      default:
        patch = parseInt(patch) + 1;
        break;
  }
  return [major, minor, patch].join(".");
}

const [, , targetVersion] = process.argv;
main(targetVersion);
