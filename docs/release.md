# How to Release

Releases are performed via [GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). After a Release is created, a CI workflow is triggered by the `release` event and packages will be published to NPM.

Prereleases publish to the `prerelease` dist-tag, while releases publish to the `latest` dist-tag.

## Performing a release

While you can go to [the Releases page](https://github.com/opticdev/optic/releases) and click "Draft a new release", the instructions below describe performing a release from the CLI.

Prerequisites:

- [GitHub CLI](https://cli.github.com)

Publish prerelease versions:

```
yarn run release --prerelease
```

Publish release versions:

```
yarn run release
```

A few notes:

- You'll be prompted to confirm the release title, prerelease status, add notes, etc.
- If you make a mistake and haven't published yet, just ctrl-c and try again.
- The branch and commit you are publishing from is what you have checked out locally. Make sure you're up to date.

## An example workflow

You have a branch of exciting new features and before merging your PR you'd like to make a prerelease for testing. Your steps might look something like,

1. Open a PR for the branch.
1. Bump the packages to a prerelease version, `yarn run version prerelease`.
1. Commit and push the version bump.
1. With your branch checked out locally, run `yarn run release --prerelease` to create a prerelease.
1. Test, etc.

Everything looks great, and you're ready to merge your PR and make a proper release!

1. Start by bumping the version again, but to a release version this time, `yarn run version patch` (or whatever is approriate).
1. Commit and push the version bump.
1. Merge your PR.
1. Checkout the `master` branch, and pull the latest changes.
1. Finally, create the release and publish the packages, `yarn run release`.

## Cleaning up a failed release

If a GH release is created, but the CI workflow fails and doesn't publish to NPM, you can clean up the GitHub side of things by running:

```shell
# delete the GH release
gh release delete `release-name`

# delete the git tag
git push --delete origin `tag`
```
