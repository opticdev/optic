## Optic

### Quick start guide

Install `optic` and `oas`:

```bash
npm i -g @useoptic/optic
```

Initialize an `optic.yml` config file

```bash
optic init
# this will create an optic.yml file with references to openapi files detected in the git repo
```

Run a diff between two OpenAPI files:

```bash
optic diff <path_to_file_1> <path_to_file_2>
```

## Analyzing changes between OpenAPI specs

Optic helps you analyze changes in your OpenAPI spec. The diff command can be used to generate a changelog between two specs. By default, Optic checks for breaking changes. There are a few ways you can run the diff command.

Running a diff between two files on your file system

```bash
optic diff specs/openapi-spec-v0.yml specs/openapi-spec-v1.yml
```

Running a diff against a file on the master branch

```bash
optic diff master:specs/openapi-spec.yml specs/openapi-spec.yml

# or

optic diff specs/openapi-spec.yml --base master
```

Running a diff on a file from your `optic.yml`

```bash
# runs a diff against the users-api id
optic diff --id users-api --base master
```

Additional options:

- `--check` turns on breaking change detection against the changed files as specified in your `optic.dev.yml` rulesets config.
- `--web` opens a web page with the changes that ran (recommended for a more UI rich changelog experience).

## Setup Optic in CI

Optic helps you review OpenAPI specs and enforce API standards. Sign up on [app.useoptic.com](https://app.useoptic.com) to get a token and get started.

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
          token: ${{ secrets.OPTIC_TOKEN }} # You will need to connect up your secret here
          base: ${{ github.event.pull_request.base.ref }}
```

### Other CI Providers

You can manually connect up Optic using any other CI provider by calling optic directly. An example implementation in bash is listed below, where each step command can be broken out into different CI steps.

```bash
# requires nodeJS installed
# install optic-ci in your CI runner
npm i -g @useoptic/optic

# create the context - these will differ between CI providers
optic cloud create-manual-context \\
  --owner <owner>  \\ # the repository owner (in github, this can be an organization or user)
  --repo <repo>  \\ # the repository name
  --pull_request <pull_request>  \\ # the pull request number that this run is associated with
  --run <run>  \\ # the run number that this run is associated with
  --commit_hash <commit_hash>  \\ # the commit hash that this run is associated with
  --branch_name <branch_name>  \\ # the branch name that this run is associated with
  --user <user> # the user that triggered this run

# trigger the optic runner
# base is the branch that you are comparing the OpenAPI Changes against - this defaults to 'origin/master'
OPTIC_TOKEN=<token> optic cloud run --base <base ref>
```
