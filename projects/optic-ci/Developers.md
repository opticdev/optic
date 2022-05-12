## Running optic-ci locally

Copy the .env.example file, `cp .env.example .env`, and replace the values in the file with your own.

In the root monorepo directory, run `task build`. Then in the project root directory `/projects/optic-ci` you can run: `yarn run local:run <optic-ci args>`

# Examples

```
yarn local:run --help
yarn local:run create-manual-context --help
```

```
yarn local:run create-manual-context \
    --owner opticdev \
    --repo monorail \
    --pull_request $(gh pr list | grep $(git branch --show-current) | awk '{print $1}') \
    --commit_hash $(git rev-parse --verify HEAD) \
    --branch_name $(git branch --show-current) \
    --user "$USER" \
    --run 1
```

```
yarn local:run compare \
    --from ./examples/example-api-v0.json \
    --to ./examples/example-api-v1.json \
    --upload-results
```
