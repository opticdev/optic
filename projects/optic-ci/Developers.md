## Running optic-ci locally

Create an env file in the project root directory `/projects/optic-ci/.env`
```bash
# .env
OPTIC_TOKEN=<your optic token>
GITHUB_TOKEN=<your github token>
```

In the root monorepo directory, run `task build`. Then in the project root directory `/projects/optic-ci` you can run: `yarn run local:run <optic-ci args>`

You can add your test data / api specs into `/projects/optic-ci/temp`