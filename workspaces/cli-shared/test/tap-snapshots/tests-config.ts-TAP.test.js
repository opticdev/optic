/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`tests/config.ts TAP config.createCliConfig can create a generic cli config given PackageJson and ProcessEnv > basic output 1`] = `
Object {
  "channel": "latest",
  "env": Object {
    "development": false,
    "production": true,
  },
  "envName": "production",
  "name": "test-package",
  "prerelease": false,
  "version": "1.2.4",
}
`

exports[`tests/config.ts TAP config.createCliConfig can create a generic cli config given PackageJson and ProcessEnv > development env 1`] = `
Object {
  "channel": "latest",
  "env": Object {
    "development": true,
    "production": false,
  },
  "envName": "development",
  "name": "test-package",
  "prerelease": false,
  "version": "1.2.4",
}
`

exports[`tests/config.ts TAP config.createCliConfig can create a generic cli config given PackageJson and ProcessEnv > prerelease output 1`] = `
Object {
  "channel": "rc",
  "env": Object {
    "development": false,
    "production": true,
  },
  "envName": "production",
  "name": "test-package",
  "prerelease": true,
  "version": "1.2.3-rc.4",
}
`
