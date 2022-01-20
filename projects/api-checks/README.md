# api-checks

API checks helps automate checks between OpenAPI changes.

## Example usage

### Configuring your CLI

```javascript
// cli.js
import { expect } from 'chai';
import { ApiCheckService, makeCiCli } from '@useoptic/api-checks';
import { ExampleDsl } from './dsl';

const checker = new ApiCheckService();

// Swap out / write your own custom rulesets
function completenessApiRules(dsl) {
  dsl.operations.changed.must(
    'have consistent operationIds',
    (current, next, context, docs) => {
      docs.includeDocsLink(
        'https://github.com/apis/guide/our-rules#operations'
      );
      expect(current.operationId).to.equal(
        next.operationId || '',
        'operation ids must be consistent'
      );
    }
  );
}

checker.useDsl(
  (input) =>
    new ExampleDsl(input.nextFacts, input.nextJsonLike, input.changelog),
  completenessApiRules
);

const cli = makeCiCli('my_cli', checker, {
  opticToken: process.env.OPTIC_TOKEN,
  gitProvider: {
    token: process.env.GITHUB_TOKEN,
    provider: 'github',
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

# Run the compare files
# this will run compare, and upload the files to optic cloud
$ node ./cli.js compare --from ./from.json --to ./to.json --context "{\"createdAt\":1639434455822}" --upload-results --ci-context ./ci-context.json
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
  "CIRCLE_REPOSITORY_URL": "https://github.com/owner/repo_name",
  "CIRCLE_BRANCH": "fix/the-git-branch-name",
  "CIRCLE_PR_NUMBER": 10,
  "CIRCLE_BUILD_NUM": 1,
  "CIRCLE_SHA1": "e756e8e68f5daaed86fafe76cd8e51400d70946a"
}
```
