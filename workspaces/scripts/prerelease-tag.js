const semver = require('semver');

function main(version) {
  const validVersion = semver.valid(version);
  if (!validVersion) {
    console.error('Expected valid semver version to return its prerelease tag');
    process.exit(1);
  }
  const prereleaseComponents = semver.prerelease(validVersion);

  const tag =
    prereleaseComponents &&
    prereleaseComponents.find((component) => typeof component === 'string');

  if (prereleaseComponents && tag) {
    console.log(tag);
  } else {
    console.error(`No prerelease tag found for ${validVersion}`);
  }
}

const [, , version] = process.argv;
main(version);
