const packageJson = require('../../package.json');
const { exec, execFileSync } = require('child_process');
const path = require('path');

const { workspaces } = packageJson;
console.log({ workspaces });
const isPrivatePublish = process.env.OPTIC_PUBLISH_SCOPE !== 'public';
const registry =
  process.env.OPTIC_PUBLISH_SCOPE === ('private' && 'http://localhost:4873') ||
  (process.env.OPTIC_PUBLISH_SCOPE === 'github' &&
    'https://npm.pkg.github.com/');
const promise = workspaces.reduce((acc, workspace) => {
  return acc.then((previousResults) => {
    return new Promise((resolve, reject) => {
      const workspacePackage = require(path.join(
        process.cwd(),
        workspace,
        'package.json'
      ));
      const packageId = `${workspacePackage.name}@${workspacePackage.version}`;
      console.log(`checking ${packageId}`);
      exec(
        `npm info ${packageId} ${
          isPrivatePublish ? `--registry ${registry}` : ''
        }`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return resolve([...previousResults, false]);
          }
          console.log(stdout);
          console.error(stderr);
          return resolve([...previousResults, stdout.length > 0]);
        }
      );
    });
  });
}, Promise.resolve([]));

promise
  .then((results) => {
    console.log(`\n\n================================\n\n`);
    return results
      .map((result, i) => {
        const workspace = workspaces[i];
        console.log(workspace, result ? 'skipping' : 'publishing');
        return {
          workspace,
          skip: result,
        };
      })
      .reduce((acc, { workspace, skip }) => {
        if (skip) {
          return acc;
        }
        return acc.then(() => {
          const cwd = path.join(process.cwd(), workspace);
          console.log(`publishing ${workspace}`);
          console.log(cwd);
          return new Promise((resolve, reject) => {
            try {
              const stdout = execFileSync(
                'npm',
                isPrivatePublish
                  ? ['publish', '--registry', registry]
                  : ['publish', '--access', 'public'],
                {
                  cwd,
                  stdio: 'inherit',
                }
              );
              console.log(stdout);
              return resolve();
            } catch (e) {
              return reject(e);
            }
          });
        });
      }, Promise.resolve([]));
  })
  .then(() => {
    console.log(`\n\n================================\n\n`);
    console.log('Done!');
  })
  .catch((e) => {
    console.error(e);
  });
