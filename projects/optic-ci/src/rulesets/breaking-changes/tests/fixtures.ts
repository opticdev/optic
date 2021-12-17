import {
  ApiChangeDsl,
  ApiCheckService,
  createTestDslFixture,
  ApiCheckDslContext,
} from '@useoptic/api-checks';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import path from 'path';
export async function rulesFixture(
  before: OpenAPIV3.Document,
  after: OpenAPIV3.Document,
  context: ApiCheckDslContext,
  rules: (dsl: ApiChangeDsl) => void
) {
  const checker = new ApiCheckService<ApiCheckDslContext>();
  checker.useDsl<ApiChangeDsl>((input) => {
    return new ApiChangeDsl(
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
  const inputs = path.join(__dirname, 'inputs', dir, name);
  return path.resolve(inputs);
}

export function createTestFixture() {
  return createTestDslFixture<ApiChangeDsl, ApiCheckDslContext>((input) => {
    return new ApiChangeDsl(
      input.nextFacts,
      input.changelog,
      input.currentJsonLike,
      input.nextJsonLike,
      input.context
    );
  });
}
