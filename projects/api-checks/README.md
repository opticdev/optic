# api-checks

API checks helps automate checks between OpenAPI changes.

## Example usage

### Configuring your CLI

```javascript
// cli.js
import { expect } from 'chai';
import { ApiCheckService, makeCiCli } from '@useoptic/api-checks';

const checker = new ApiCheckService();

const cli = makeCiCli('my_cli', checker, {
  opticToken: process.env.OPTIC_TOKEN,
  gitProvider: {
    token: process.env.GITHUB_TOKEN,
  },
  ciProvider: 'github',
});

cli.parse(process.argv);
```

### Setting up your build pipeline

Currently, only CircleCi and Github Actions are supported. There's three main commands to this flow:

- compare (compares two OpenAPI files together)

```bash
# Output the open api files from somewhere
$ node ./consolidate-open-api-files.js

# For github actions
$ echo $GITHUB_CONTEXT > ./ci-context.json

# Generate contextual information about the run from the environment.
# Current valid providers: [github, circleci]
$ node ./cli.js create-context --provider <provider>

# Run the compare files
# this will run compare, and upload the files to optic cloud
$ node ./cli.js compare --from ./from.json --to ./to.json --context "{\"createdAt\":1639434455822}" --upload-results
```

### Expected contexts
#### Github Actions Context
The easiest way to dump this is from github actions:
```
...
  env:
    GITHUB_CONTEXT: ${{ toJSON(github) }}
  run: echo "$GITHUB_CONTEXT" > ./ci-context.json
```

#### CircleCI Context

Expected JSON values are:
```json
{
  "CIRCLE_PROJECT_USERNAME": "owner",
  "CIRCLE_PULL_REQUEST": "https://github.com/owner/repo_name/pull/10",
  "CIRCLE_PROJECT_REPONAME": "repo_name",
  "CIRCLE_BRANCH": "fix/the-git-branch-name",
  "CIRCLE_SHA1": "e756e8e68f5daaed86fafe76cd8e51400d70946a",
  "CIRCLE_BUILD_NUM": 1,
  "CIRCLE_PR_USERNAME": "pr_author",
```

**Note** `CIRCLE_PR_USERNAME` is not always available - the variable `OPTIC_COMMIT_USER` may be set instead with a user value (such as the commit author from Git).