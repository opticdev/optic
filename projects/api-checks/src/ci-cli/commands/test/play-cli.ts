import { ApiCheckService } from "../../../sdk/api-check-service";
import { ExampleDsl, ExampleDslContext } from "../../../sdk/test/example-dsl";
import { expect } from "chai";
import { makeCiCli } from "../../make-cli";
import path from "path";
const checker: ApiCheckService<ExampleDslContext> =
  new ApiCheckService<ExampleDslContext>();

function completenessApiRules(dsl: ExampleDsl) {
  dsl.operations.changed.must(
    "have consistent operationIds",
    (current, next, context, docs) => {
      docs.includeDocsLink(
        "https://github.com/apis/guide/our-rules#operations"
      );
      expect(current.operationId).to.equal(
        next.operationId || "",
        "operation ids must be consistent"
      );
    }
  );
}

checker.useDsl(
  (input) => new ExampleDsl(input.nextFacts, input.changelog),
  completenessApiRules
);

const cli = makeCiCli("play-thing", checker);

cli.parse([
  "",
  "",
  "compare",
  `--from=${path.join(__dirname, "inputs", "v0.json")}`,
  `--to=${path.join(__dirname, "inputs", "v1.json")}`,
  `--context="{}"`,
]);
