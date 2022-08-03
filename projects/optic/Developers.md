## Running optic-ci locally

Copy the .env.example file, `cp .env.example .env`, and replace the values in the file with your own.

In the root monorepo directory, run `task build`. Then in the project root directory `/projects/optic-ci` you can run: `yarn run local:run <optic-ci args>`

# Examples

```
yarn local:run --help
yarn local:run init --help
```
