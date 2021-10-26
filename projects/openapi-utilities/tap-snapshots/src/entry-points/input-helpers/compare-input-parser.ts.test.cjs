/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`src/entry-points/input-helpers/compare-input-parser.ts TAP > file 1`] = `
Object {
  "filePath": "/path/to/spec.json",
  "from": 0,
}
`

exports[`src/entry-points/input-helpers/compare-input-parser.ts TAP > file without leading slash 1`] = `
Object {
  "branch": "feature/1/define-spc",
  "from": 1,
  "name": "path/to/spec.json",
}
`

exports[`src/entry-points/input-helpers/compare-input-parser.ts TAP > rev with / in it 1`] = `
Object {
  "branch": "feature/1",
  "from": 1,
  "name": "spec.json",
}
`

exports[`src/entry-points/input-helpers/compare-input-parser.ts TAP > rev-main 1`] = `
Object {
  "branch": "main",
  "from": 1,
  "name": "path/to/spec.json",
}
`
