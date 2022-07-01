## Optic CI

Optic CI helps you review OpenAPI specs and enforce API standards. Sign up on [app.useoptic.com](https://app.useoptic.com) to get a token and get started.

## Setup in CI

### GitHub Actions

Optic comes with a GitHub Action for easy setup and configuration. The Optic GitHub Action can be configured in your `.github/workflows/optic-ci.yml` file. An example snippet is listed below.

```yml
name: Optic

on: [pull_request]

jobs:
  optic-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: optic run
        uses: opticdev/github-action@v1
        with:
          token: \${{ secrets.OPTIC_TOKEN }} # You will need to connect up your secret here
          base: \${{ github.event.pull_request.base.ref }}
```


### Other CI Providers

You can manually connect up Optic using any other CI provider by calling optic-ci directly. An example implementation in bash is listed below, where each step command can be broken out into different CI steps.
```bash
# requires nodeJS installed
# install optic-ci in your CI runner
npm i -g @useoptic/optic-ci

# create the context - these will differ between CI providers
optic-ci create-manual-context \\
  --owner <owner>  \\ # the repository owner (in github, this can be an organization or user)
  --repo <repo>  \\ # the repository name
  --pull_request <pull_request>  \\ # the pull request number that this run is associated with
  --run <run>  \\ # the run number that this run is associated with
  --commit_hash <commit_hash>  \\ # the commit hash that this run is associated with
  --branch_name <branch_name>  \\ # the branch name that this run is associated with
  --user <user> # the user that triggered this run

# trigger the optic runner
# base is the branch that you are comparing the OpenAPI Changes against - this defaults to 'origin/master'
OPTIC_TOKEN=<token> optic-ci run --base <base ref>
```
