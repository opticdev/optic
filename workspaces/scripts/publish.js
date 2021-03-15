const path = require('path');
const { exec, execFileSync } = require('child_process');
const packageJson = require(path.join(process.cwd(), 'package.json'));
const semver = require('semver');

const { workspaces } = packageJson;
console.log({ workspaces });
const isPrivatePublish = process.env.OPTIC_PUBLISH_SCOPE !== 'public';
const registry =
  (process.env.OPTIC_PUBLISH_SCOPE === 'private' && (process.env.NPM_REGISTRY || 'http://localhost:4873')) ||
  (process.env.OPTIC_PUBLISH_SCOPE === 'github' &&
    'https://npm.pkg.github.com/useoptic');
const skipList = new Set((process.env.OPTIC_SKIP_CSV || '').split(','));
const packages = workspaces.map((workspace) => {
  const workspacePath = path.join(process.cwd(), workspace);
  const manifest = require(path.join(workspacePath, 'package.json'));
  return {
    cwd: workspacePath,
    name: manifest.name,
    version: manifest.version
  };
});
const promise = packages.reduce((acc, { name, version }) => {
  return acc.then((previousResults) => {
    return new Promise((resolve, reject) => {
      const packageId = `${name}@${version}`;
      console.log(`checking ${packageId}`);
      if (skipList.has(name)) {
        console.log(`force skipping ${name}`);
        return resolve([...previousResults, true]);
      }
      const promise =
        registry === (process.env.NPM_REGISTRY || 'http://localhost:4873')
          ? new Promise((resolve1, reject1) => {
              console.log(`\nunpublish ${packageId}`);
              exec(
                `npm unpublish ${name} --force --registry ${registry}`,
                (err, stdout, stderr) => {
                  if (err) {
                    console.error(err);
                    return resolve1();
                  }
                  console.log(stdout);
                  console.error(stderr);
                  return resolve1();
                }
              );
            })
          : Promise.resolve();

      console.log(`\ninfo ${packageId}`);
      promise.then(() => {
        exec(
          `npm info ${packageId} ${
            isPrivatePublish ? `--registry ${registry}` : ''
          }`,
          (err, stdout, stderr) => {
            if (err) {
              //console.error(err);
              return resolve([...previousResults, false]);
            }
            console.log(stdout);
            //console.error(stderr);
            return resolve([...previousResults, stdout.length > 0]);
          }
        );
      });
    });
  });
}, Promise.resolve([]));

promise
  .then((results) => {
    console.log(`\n\n================================\n\n`);
    return results
      .map((result, i) => {
        const package = packages[i];
        console.log(package, result ? 'skipping' : 'publishing');

        const prereleaseComponents = semver.prerelease(package.version);
        const tag = !prereleaseComponents
          ? 'latest'
          : prereleaseComponents.find(
              (component) => typeof component === 'string'
            ) || 'unstable';

        return {
          cwd: package.cwd,
          name: package.name,
          version: package.version,
          tag,
          skip: result,
        };
      })
      .reduce((acc, { cwd, name, skip, version, tag }) => {
        if (skip) {
          return acc;
        }
        return acc.then(() => {
          console.log(`publishing ${name}@${version} tagged ${tag}`);
          console.log(cwd);
          return new Promise((resolve, reject) => {
            try {
              const stdout = execFileSync(
                'npm',
                isPrivatePublish
                  ? ['publish', '--registry', registry]
                  : ['publish', '--access', 'public', '-ddd', '--tag', tag],
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
    process.exit(1);
  });
