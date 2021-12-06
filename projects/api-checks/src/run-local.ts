import { expect } from 'chai';
import { ApiCheckService } from './sdk/api-check-service';
import { ExampleDsl, ExampleDslContext } from './sdk/test/example-dsl';
import { makeCiCli } from './ci-cli/make-cli';

const checker: ApiCheckService<ExampleDslContext> =
  new ApiCheckService<ExampleDslContext>();

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

const cli = makeCiCli('play-thing', checker, {
  opticToken: '123',
});

cli.parse(process.argv);
