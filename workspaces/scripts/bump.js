// this script is meant to be run via `yarn bump <whatever version>`
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');

const semverIncrements = [
  'minor',
  'major',
  'patch',
  'premajor',
  'preminor',
  'prepatch',
  'prerelease',
];

async function main(targetVersion, preId) {
  const silentMode = JSON.parse(process.env.npm_config_argv).original.includes('--silent');
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  if (!targetVersion || semverIncrements.includes(targetVersion)) {
    incrementAllPackages(targetVersion, preId);
    return;
  } else {
    console.log(`setting workspace versions to ${targetVersion}`);
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
async function incrementAllPackages(increment = "patch", preId, silentMode) {
  let log = console.log;
  if (silentMode) {
    console.log = () => {} // disable logging
  }
  console.log(`performing a ${increment} bump`)
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  const versions = {}
  let version = ""
  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        const old = targetPackage.version;

        targetPackage.version = semver.inc(
          targetPackage.version,
          increment,
          preId
        );
        console.log(`bumping ${old} to ${targetPackage.version}`)
        versions[targetPackage.name] = targetPackage.version;
        version = targetPackage.version;
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
  log(version);
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

const [, , targetVersion, preId] = process.argv;
main(targetVersion, preId);
