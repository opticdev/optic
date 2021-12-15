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
});

cli.parse(process.argv);
```

### Setting up your build pipeline

Currently, only CircleCi and Github Actions are supported. There's three main commands to this flow:

- compare (compares two OpenAPI files together)
- upload (uploads the OpenAPI files, and the output of compare)
- github-comment (posts a github comment to the link to Optic with the ci run)

<!-- TODO write this as a GHA workflow or circleci job -->

```bash
# Output the open api files from somewhere
$ node ./consolidate-open-api-files.js

# Run the compare files
# outputs compare-output.json
$ node ./cli.js compare --from ./from.json --to ./to.json --context {} --create-file

# Build out the context file
# Expected output is a JSONified file
$ echo $GITHUB_CONTEXT > ./ci-context.json
# Run the upload flow (can set the env externally)
# outputs upload-output.json
$ OPTIC_TOKEN="INSERT_YOUR_TOKEN" node ./cli.js upload \
		--from ./from.json \
		--to ./to.json \
		--provider github \
		--ci-context ./ci-context.json \
		--rules ./compare-output.json

# Post a comment on the PR (creates OR update the existing comment)
$ node ./cli.js github-comment \
		--token $GH_TOKEN
		--provider github \
		--ci-context ./ci-context.json
		--upload ./upload-output.json
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
  "CIRCLE_PR_NUMBER": 10,
  "CIRCLE_BUILD_NUM": 1,
  "CIRCLE_SHA1": "e756e8e68f5daaed86fafe76cd8e51400d70946a"
}
```
