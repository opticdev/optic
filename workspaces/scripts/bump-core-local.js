// this script is meant to be run via `yarn bump <whatever version>`
const path = require('path');
const fs = require('fs-extra');

async function main(localRoot) {
  const localOpticCore = fs
    .readFileSync(path.join(__dirname, '../../.local-optic-core'))
    .toString()
    .trim();

  if (!localOpticCore) {
    throw new Error(
      'Add a .local-optic-core file to your root so Optic knows where optic-core lives locally'
    );
  }

  const opticCoreWorkspaceHome = path.resolve(
    path.join(localOpticCore, 'workspace', 'packages')
  );

  const packageJson = await fs.readJson('./package.json');
  const { workspaces } = packageJson;
  console.log(`setting workspace versions to file:/...`);
  console.log(workspaces.map((x) => ` - ${x}\n`).join(''));
  const tasks = workspaces.map((workspace) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        const targetPackage = await fs.readJson(`./${workspace}/package.json`);
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
  const packageNames = [
    '@useoptic/domain',
    '@useoptic/domain-types',
    '@useoptic/domain-utilities',
  ];
  console.log(packageNames.map((x) => ` - ${x}\n`).join(''));
  const updateVersionTasks = results.map((result) => {
    const task = new Promise(async (resolve, reject) => {
      try {
        packageNames.map((packageName) => {
          if (result.package.dependencies[packageName]) {
            result.package.dependencies[
              packageName
            ] = `file:${opticCoreWorkspaceHome}/${packageName.split('/')[1]}`;
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
