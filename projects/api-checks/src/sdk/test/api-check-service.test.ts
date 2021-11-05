import { ApiCheckService } from "../api-check-service";
import { ExampleDsl, ExampleDslContext } from "./example-dsl";
import { OpenAPIV3 } from "@useoptic/openapi-utilities";
export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {},
  info: { version: "0.0.0", title: "Empty" },
};

function completenessApiRules(dsl: ExampleDsl) {
  dsl.operations.changed.must(
    "have consistent operationIds",
    (current, next, context, docs) => {
      const { expect } = require("chai"); // Using Assert style

      expect(current.operationId).to.equal(
        next.operationId || "",
        "operation ids must be consistent"
      );
    }
  );
  dsl.operations.requirement.must(
    "be able to see spec",
    (value, context, docs, specItem) => {
      expect(specItem).toBeTruthy();
    }
  );
}

it("can run dsl rules through check service", async (done) => {
  const checker = new ApiCheckService<ExampleDslContext>();

  checker.useDsl(
    (input) =>
      new ExampleDsl(input.nextFacts, input.nextJsonLike, input.changelog),
    completenessApiRules
  );

  const results = await checker.runRules(
    {
      ...defaultEmptySpec,
      paths: {
        "/example": {
          get: {
            operationId: "getExample",
            responses: {},
          },
        },
      },
    },
    {
      ...defaultEmptySpec,
      paths: {
        "/example": {
          get: {
            operationId: "get_example",
            responses: {},
          },
        },
      },
    },

    { maturity: "wip" }
  );

  expect(results).toMatchSnapshot();
  done();
});
