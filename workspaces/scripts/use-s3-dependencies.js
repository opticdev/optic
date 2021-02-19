// this script is meant to be run via `S3_HTTPS_URL=https://xyz.com VERSION=1.2.3-beta.4 node workspaces/scripts/use-s3-dependencies.js`
const path = require('path');
const fs = require('fs-extra');

async function main(input) {
  const {baseUrl, packageVersion} = input;
  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  
  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
        targetPackage.version = packageVersion;
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
            const name = packageName.substring('@useoptic/'.length);
            const url = `${baseUrl}/${packageVersion}/${name}-${packageVersion}.tgz`
            result.package.dependencies[packageName] = url;
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

const {
  S3_HTTPS_URL,
  VERSION
} = process.env;
main({
  baseUrl: S3_HTTPS_URL,
  packageVersion: VERSION
})