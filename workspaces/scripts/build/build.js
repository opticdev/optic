const {exec} = require('child_process')
//@TODO: check output of yarn workspaces info for x -> mismatchedWorkspaceDependencies
new Promise((resolve, reject) => {
  exec('yarn workspaces run ws:test', (err, stdout, stderr) => {
    console.log(stdout)
    console.error(stderr)
    if (err) {
      return reject()
    }
    resolve()
  })
})
  .then(() => {
    return new Promise((resolve, reject) => {
      exec('yarn workspaces run ws:build', (err, stdout, stderr) => {
        console.log(stdout)
        console.error(stderr)

        if (err) {
          return reject()
        }
        resolve()
      })
    })
  })
