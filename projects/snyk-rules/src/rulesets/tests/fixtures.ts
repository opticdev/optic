import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";
import { ApiCheckService, createTestDslFixture } from "@useoptic/api-checks";
import { OpenAPIV3 } from "@useoptic/openapi-utilities";
import path from "path";
export async function rulesFixture(
  before: OpenAPIV3.Document,
  after: OpenAPIV3.Document,
  context: SynkApiCheckContext,
  rules: (dsl: SnykApiCheckDsl) => void
) {
  const checker = new ApiCheckService<SynkApiCheckContext>();
  checker.useDsl<SnykApiCheckDsl>((input) => {
    return new SnykApiCheckDsl(
      input.nextFacts,
      input.changelog,
      input.currentJsonLike,
      input.nextJsonLike,
      input.context
    );
  }, rules);
  const results = await checker.runRules(before, after, context);
  return results;
}

export async function inputFrom(dir: string, name: string) {
  const inputs = path.join(__dirname, "inputs", dir, name);
  return path.resolve(inputs);
}

export function createSnykTestFixture() {
  return createTestDslFixture<SnykApiCheckDsl, SynkApiCheckContext>((input) => {
    return new SnykApiCheckDsl(
      input.nextFacts,
      input.changelog,
      input.currentJsonLike,
      input.nextJsonLike,
      input.context
    );
  });
}
