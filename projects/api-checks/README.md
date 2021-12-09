# api-checks

API checks helps automate checks between OpenAPI changes.

## Example usage

### Configuring your CLI
```typescript
// cli.ts
import { expect } from 'chai';
import { ApiCheckService } from './sdk/api-check-service';
import { ExampleDsl, ExampleDslContext } from './sdk/test/example-dsl';
import { makeCiCli } from './ci-cli/make-cli';

const checker: ApiCheckService<ExampleDslContext> =
  new ApiCheckService<ExampleDslContext>();

// Swap out / write your own custom rulesets
function completenessApiRules(dsl: ExampleDsl) {
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
$ ts-node ./consolidate-open-api-files.ts

# Run the compare files 
# outputs compare-output.json
$ ts-node ./cli.ts compare --from ./from.json --to ./to.json --context {}

# Build out the context file
# Expected output is a JSONified file
$ echo $GITHUB_CONTEXT > ./ci-context.json
# Run the upload flow (can set the env externally)
# outputs upload-output.json
$ OPTIC_TOKEN="INSERT_YOUR_TOKEN" ts-node ./cli.ts upload \
		--from ./from.json \
		--to ./to.json \
		--provider github \
		--ci-context ./ci-context.json \
		--rules ./compare-output.json

# Post a comment on the PR (creates OR update the existing comment)
$ ts-node ts-node ./cli.ts comment \
		--token $GH_TOKEN
		--provider github \
		--ci-context ./ci-context.json
		--upload-results ./upload-output.json
```
